-- Friends table (bidirectional friendship)
CREATE TABLE friends (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES "user"(id),
    CONSTRAINT fk_friend FOREIGN KEY(friend_id) REFERENCES "user"(id),
    CONSTRAINT unique_friendship UNIQUE(user_id, friend_id)
);

-- Friend requests table
CREATE TABLE friend_requests (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, declined
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sender FOREIGN KEY(sender_id) REFERENCES "user"(id),
    CONSTRAINT fk_receiver FOREIGN KEY(receiver_id) REFERENCES "user"(id),
    CONSTRAINT unique_request UNIQUE(sender_id, receiver_id)
);