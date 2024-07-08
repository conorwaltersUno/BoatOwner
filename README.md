# BoatOwner

BoatOwner

## What is the purpose of the application?

Owning a boat can be quite challenging, requiring attention to numerous details ranging from maintenance and upkeep to managing finances and keeping track of all the small tasks that need to be completed throughout the year. Finding an effective way to organize and manage all this information can be daunting for any boat owner.

That's where BoatOwner comes in. BoatOwner is a versatile iOS/Android app designed specifically for boat owners to streamline the management of their vessels. This app offers a wide range of features that help users keep track of every aspect of boat ownership. With BoatOwner, users can log and monitor their expeditions and crossings, ensuring that every journey is recorded for future reference. The app also aids in planning and scheduling maintenance work, allowing boat owners to stay on top of necessary repairs and upkeep.

Additionally, BoatOwner includes robust financial tracking capabilities. Users can manage their expenses and keep detailed records of all costs associated with boat ownership, from fuel and docking fees to repairs and upgrades. This comprehensive financial oversight helps users budget more effectively and avoid unexpected expenses.

One of the standout features of BoatOwner is its ability to maintain a detailed log of all passages made during ownership. This log not only serves as a valuable record for the owner but also adds to the boat's documented history, which can be beneficial if the owner decides to sell the boat in the future.

In summary, BoatOwner is an essential tool for any boat owner looking to simplify and enhance their boating experience. It provides a centralized platform for managing all aspects of boat ownership, from tracking journeys and planning maintenance to monitoring finances and maintaining detailed logs. With BoatOwner, boat owners can enjoy their time on the water without the stress of juggling numerous responsibilities.

## Domain Model Diagram

```mermaid
flowchart
 USER --- BOAT
 BOAT --- Logs_Boat
 BOAT --- Task_Boat
 BOAT --- Expenses_Boat
 Logs_Boat --- LOGS
 Task_Boat --- TASKS
 Expenses_Boat --- EXPENSES
```

## Entity Relationship Diagram

```mermaid
erDiagram
    user ||--o{ boat : ""
    boat ||--o{ expense_boat : ""
    boat ||--o{ logs_boat : ""
    boat ||--o{ tasks_boat : ""
    expense_boat }o--|| boat : ""
    logs_boat }o--|| boat : ""
    tasks_boat }o--|| boat : ""


 user {
    serial id PK
    varchar email_address
    varchar password
    timestamp created
}
 boat {
    int user_id FK
    varchar name
    varchar model
}
logs_boat {
    serial boat_id FK
    serial log_id FK
}
logs {
    serial id PK
    string descrption
    array crew_memebers
    array coordinates
    array photo_urls
    timestamp log_started
    timestamp log_ended
    timestamp created_on
    boolean isRecordingLocation
}
tasks_boat {
    serial boat_id FK
    serial tasks_id FK
}
tasks {
    serial id PK
    varchar description
    varchar status
    timestamp created_on
}
expenses_boat {
    serial boat_id FK
    serial expenses_id FK
}
expenses {
    serial id PK
    varchar expense_type
    int amount
    timestamp expense_date
    timestamp created_on
}

```
