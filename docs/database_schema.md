# Database Schema Documentation

## Overview

The application uses Supabase as its backend database, with PostgreSQL as the underlying database engine. This document outlines the database schema, tables, relationships, and security policies.

## Tables

### 1. users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);
```

### 2. prescriptions
```sql
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    date DATE NOT NULL,
    diagnosis TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. medications
```sql
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. prescription_images
```sql
CREATE TABLE prescription_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. user_sessions
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Relationships

### 1. User Relationships
- One user can have many prescriptions (1:N)
- One user can have many sessions (1:N)

### 2. Prescription Relationships
- One prescription belongs to one user (N:1)
- One prescription can have many medications (1:N)
- One prescription can have many images (1:N)

## Indexes

```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Prescriptions table indexes
CREATE INDEX idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_date ON prescriptions(date);

-- Medications table indexes
CREATE INDEX idx_medications_prescription_id ON medications(prescription_id);

-- Prescription images table indexes
CREATE INDEX idx_prescription_images_prescription_id ON prescription_images(prescription_id);

-- User sessions table indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_device_id ON user_sessions(device_id);
```

## Security Policies

### 1. Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Prescriptions table policies
CREATE POLICY "Users can view their own prescriptions"
    ON prescriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create prescriptions"
    ON prescriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions"
    ON prescriptions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions"
    ON prescriptions FOR DELETE
    USING (auth.uid() = user_id);
```

## Database Functions

### 1. Update Timestamp Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 2. Trigger for Updated At
```sql
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Data Types

### 1. UUID
- Used for primary keys
- Generated using uuid_generate_v4()
- Ensures unique identifiers across tables

### 2. TIMESTAMP WITH TIME ZONE
- Used for created_at, updated_at, and last_login fields
- Stores date and time with timezone information
- Default value set to NOW()

### 3. TEXT
- Used for variable-length strings
- No length limit specified
- Used for names, descriptions, and URLs

## Best Practices

1. **Data Integrity**
   - Use foreign key constraints
   - Implement cascading deletes where appropriate
   - Use appropriate data types

2. **Performance**
   - Create indexes on frequently queried columns
   - Use appropriate column types
   - Implement proper table partitioning if needed

3. **Security**
   - Enable Row Level Security
   - Implement proper access policies
   - Use parameterized queries

4. **Maintenance**
   - Regular backups
   - Monitor query performance
   - Update statistics regularly 