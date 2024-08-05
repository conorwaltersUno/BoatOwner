CREATE TABLE user (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE boat (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES "user"(id)
);

CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    boat_id SERIAL NOT NULL,
    description TEXT NOT NULL,
    crew_members TEXT[] NOT NULL,
    coordinates TEXT[] NOT NULL,
    photo_urls TEXT[] NOT NULL,
    log_started TIMESTAMP NOT NULL,
    log_ended TIMESTAMP NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    isRecordingLocation BOOLEAN NOT NULL,
    CONSTRAINT fk_boat
        FOREIGN KEY(boat_id)
        REFERENCES boat(id)
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    boat_id SERIAL NOT NULL,
    description VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_boat
        FOREIGN KEY(boat_id)
        REFERENCES boat(id)
);

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    boat_id SERIAL NOT NULL,
    expense_type VARCHAR(255) NOT NULL,
    amount INT NOT NULL,
    expense_date TIMESTAMP NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_boat
        FOREIGN KEY(boat_id)
        REFERENCES boat(id)
);
