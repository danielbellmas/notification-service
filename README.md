# Notification Service

## Intro

The `notification-service` is responsible for sending notifications to the user when todos reach their deadlines. It periodically checks the todos in the database and triggers notifications for todos that have their deadlines approaching.

## Assumptions

1. The notification logic uses the `sendNotification()` method, which is assumed to be already implemented and handles the actual sending of notifications.
1. A notification is triggered when a todo's deadline is within 24 hours.

## Running the Application

1. Clone the repository: `git clone https://github.com/danielbellmas/notification-service.git`

1. Install the dependencies:
   ```bash
   npm install
   ```
1. Start the `notification`:
   ```bash
   npm start
   ```
