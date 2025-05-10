# Schemat bazy danych - AIPersonalPlanner

## 1. Tabele

### users

This table is managed by Supabase Auth.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger dla automatycznej aktualizacji updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();
```

### password_reset_tokens
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    used BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT valid_token CHECK (
        -- Token ważny tylko przez 30 minut
        (EXTRACT(EPOCH FROM (NOW() - created_at)) / 60) <= 30 OR used = TRUE
    )
);

-- Indeks dla szybkiego wyszukiwania tokenów
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
```

### meeting_preferences
```sql
-- Enum dla preferencji rozkładu spotkań
CREATE TYPE meeting_distribution AS ENUM ('rozłożone', 'skondensowane');

-- Enum dla pór dnia
CREATE TYPE time_of_day AS ENUM ('rano', 'dzień', 'wieczór');

CREATE TABLE meeting_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_distribution meeting_distribution NOT NULL DEFAULT 'rozłożone',
    preferred_times_of_day time_of_day[] NOT NULL DEFAULT '{"rano", "dzień", "wieczór"}',
    min_break_minutes INTEGER DEFAULT NULL,
    unavailable_weekdays INTEGER[] NOT NULL DEFAULT '{}',
    CONSTRAINT unique_user_preferences UNIQUE (user_id),
    CONSTRAINT valid_min_break CHECK (min_break_minutes >= 0)
);
```

### meeting_categories
```sql
CREATE TABLE meeting_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    suggested_attire VARCHAR(255) DEFAULT NULL
);

-- Inicjalne kategorie spotkań
INSERT INTO meeting_categories (name, suggested_attire) VALUES
    ('Biznesowe', 'Strój formalny - garnitur/kostium biznesowy'),
    ('Prywatne', 'Strój casualowy'),
    ('Edukacyjne', 'Strój smart casual'),
    ('Medyczne', 'Wygodny, luźny strój'),
    ('Urzędowe', 'Strój formalny');
```

### meetings
```sql
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES meeting_categories(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location_name VARCHAR(255),
    coordinates POINT,
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    original_note TEXT,
    ai_generated_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_meeting_times CHECK (end_time > start_time)
);

-- Indeksy dla często używanych zapytań
CREATE INDEX idx_meetings_user_id_start_time ON meetings(user_id, start_time);
CREATE INDEX idx_meetings_category_id ON meetings(category_id);
CREATE INDEX idx_meetings_deleted_at ON meetings(deleted_at) WHERE deleted_at IS NULL;
```

### proposal_stats
```sql
CREATE TYPE stats_period_type AS ENUM ('month', 'year');

CREATE TABLE proposal_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_type stats_period_type NOT NULL,
    period_start_date DATE NOT NULL,
    total_generations INTEGER NOT NULL DEFAULT 0,
    accepted_proposals INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_period UNIQUE (user_id, period_type, period_start_date),
    CONSTRAINT valid_stats CHECK (accepted_proposals <= total_generations)
);

-- Indeks dla szybkiego wyszukiwania statystyk użytkownika
CREATE INDEX idx_proposal_stats_user_id ON proposal_stats(user_id);
```

## 2. Widoki

### upcoming_meetings
```sql
CREATE VIEW upcoming_meetings AS
SELECT 
    m.id,
    m.user_id,
    m.title,
    m.description,
    c.name AS category_name,
    c.suggested_attire,
    m.start_time,
    m.end_time,
    m.location_name,
    m.coordinates,
    m.ai_generated,
    m.ai_generated_notes
FROM 
    meetings m
JOIN 
    meeting_categories c ON m.category_id = c.id
WHERE 
    m.deleted_at IS NULL
    AND m.start_time > NOW()
ORDER BY 
    m.start_time ASC;
```

## 3. Funkcje i triggery

### set_updated_at_timestamp()
```sql
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### update_proposal_stats()
```sql
-- Funkcja do aktualizacji statystyk propozycji
CREATE OR REPLACE FUNCTION update_proposal_stats()
RETURNS TRIGGER AS $$
DECLARE
    current_month DATE := date_trunc('month', NOW())::DATE;
    current_year DATE := date_trunc('year', NOW())::DATE;
    month_stats_id UUID;
    year_stats_id UUID;
BEGIN
    -- Aktualizacja statystyk miesięcznych
    SELECT id INTO month_stats_id FROM proposal_stats 
    WHERE user_id = NEW.user_id 
      AND period_type = 'month' 
      AND period_start_date = current_month;
      
    IF NOT FOUND THEN
        INSERT INTO proposal_stats 
            (user_id, period_type, period_start_date, total_generations, accepted_proposals)
        VALUES 
            (NEW.user_id, 'month', current_month, 0, 0)
        RETURNING id INTO month_stats_id;
    END IF;
    
    -- Aktualizacja statystyk rocznych
    SELECT id INTO year_stats_id FROM proposal_stats 
    WHERE user_id = NEW.user_id 
      AND period_type = 'year' 
      AND period_start_date = current_year;
      
    IF NOT FOUND THEN
        INSERT INTO proposal_stats 
            (user_id, period_type, period_start_date, total_generations, accepted_proposals)
        VALUES 
            (NEW.user_id, 'year', current_year, 0, 0)
        RETURNING id INTO year_stats_id;
    END IF;
    
    -- Aktualizacja liczników
    IF TG_OP = 'INSERT' AND NEW.ai_generated = TRUE THEN
        -- Zwiększ licznik akceptacji dla wstawionych spotkań AI-generated
        UPDATE proposal_stats SET 
            accepted_proposals = accepted_proposals + 1,
            last_updated = NOW()
        WHERE id IN (month_stats_id, year_stats_id);
        
        -- Zwiększ licznik generacji
        UPDATE proposal_stats SET 
            total_generations = total_generations + 1,
            last_updated = NOW()
        WHERE id IN (month_stats_id, year_stats_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger dla aktualizacji statystyk
CREATE TRIGGER update_stats_after_meeting_insert
AFTER INSERT ON meetings
FOR EACH ROW
EXECUTE FUNCTION update_proposal_stats();
```

### calculate_overall_acceptance_rate()
```sql
-- Funkcja do obliczania ogólnego współczynnika akceptacji
CREATE OR REPLACE FUNCTION calculate_overall_acceptance_rate(period_type_param stats_period_type)
RETURNS DECIMAL AS $$
DECLARE
    total_gens INTEGER;
    total_accepts INTEGER;
    acceptance_rate DECIMAL;
BEGIN
    SELECT 
        COALESCE(SUM(total_generations), 0),
        COALESCE(SUM(accepted_proposals), 0)
    INTO 
        total_gens, total_accepts
    FROM 
        proposal_stats
    WHERE 
        period_type = period_type_param;
        
    IF total_gens = 0 THEN
        RETURN 0;
    ELSE
        RETURN ROUND((total_accepts::DECIMAL / total_gens::DECIMAL) * 100, 2);
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### cleanup_old_data()
```sql
-- Funkcja do usuwania danych starszych niż rok
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Soft delete dla spotkań starszych niż rok
    UPDATE meetings 
    SET deleted_at = NOW() 
    WHERE 
        deleted_at IS NULL AND 
        end_time < (NOW() - INTERVAL '1 year');
        
    -- Usuwanie wykorzystanych tokenów resetowania hasła
    DELETE FROM password_reset_tokens 
    WHERE 
        used = TRUE OR 
        created_at < (NOW() - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql;
```

## 4. Row Level Security (RLS)

### Polityki dla tabeli users
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON users
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY users_update_own ON users
    FOR UPDATE
    USING (id = auth.uid());
```

### Polityki dla tabeli meeting_preferences
```sql
ALTER TABLE meeting_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY meeting_preferences_select_own ON meeting_preferences
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY meeting_preferences_insert_own ON meeting_preferences
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY meeting_preferences_update_own ON meeting_preferences
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY meeting_preferences_delete_own ON meeting_preferences
    FOR DELETE
    USING (user_id = auth.uid());
```

### Polityki dla tabeli meetings
```sql
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY meetings_select_own ON meetings
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY meetings_insert_own ON meetings
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY meetings_update_own ON meetings
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY meetings_delete_own ON meetings
    FOR DELETE
    USING (user_id = auth.uid());
```

### Polityki dla tabeli proposal_stats
```sql
ALTER TABLE proposal_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY proposal_stats_select_own ON proposal_stats
    FOR SELECT
    USING (user_id = auth.uid());
```

## 5. Rozszerzenia

```sql
-- Aktywacja rozszerzenia PostGIS dla obsługi danych przestrzennych
CREATE EXTENSION IF NOT EXISTS postgis;

-- Aktywacja rozszerzenia pgcrypto dla generowania UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## 6. Zadania cykliczne

### Zadanie do czyszczenia starych danych
```sql
-- Konfiguracja zadania cyklicznego przy użyciu pg_cron (wymaga instalacji rozszerzenia)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Uruchomienie raz dziennie o północy
-- SELECT cron.schedule('0 0 * * *', 'SELECT cleanup_old_data()');
```

## 7. Dodatkowe uwagi

1. **Implementacja eksportu do Google Calendar**: 
   - Mechanizm eksportu będzie zaimplementowany na poziomie aplikacji, generując plik iCalendar (.ics) na podstawie danych z tabeli meetings.

2. **Formatowanie AI-wygenerowanych notatek**: 
   - Kolumna ai_generated_notes w tabeli meetings będzie przechowywać tekst w formacie Markdown, który zostanie odpowiednio przetworzony i wyświetlony w interfejsie użytkownika.

3. **Zabezpieczenia**:
   - Wszystkie hasła są przechowywane w postaci haszowanej.
   - Row Level Security (RLS) zapewnia, że użytkownicy mogą przeglądać, modyfikować i usuwać tylko własne dane.
   - Dodatkowa autoryzacja powinna być zaimplementowana na poziomie aplikacji.

4. **Skalowalność**:
   - Indeksy zostały dodane dla najczęściej używanych kolumn, aby zapewnić szybkie wyszukiwanie.
   - Mechanizm soft delete dla spotkań pomaga w zarządzaniu danymi bez utraty historii.
   - Dla bazy danych o większej skali zalecane jest wprowadzenie partycjonowania tabeli meetings według daty. 