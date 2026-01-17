# Налаштування Firebase для SkladWeb

## Крок 1: Створення проекту Firebase

1. Перейдіть на https://console.firebase.google.com/
2. Натисніть **"Create a project"** (Створити проект)
3. Введіть назву проекту: `skladweb` (або будь-яку іншу)
4. Вимкніть Google Analytics (необов'язково)
5. Натисніть **"Create project"**

## Крок 2: Додавання веб-додатку

1. На головній сторінці проекту натисніть іконку **</>** (Web)
2. Введіть назву додатку: `SkladWeb`
3. **НЕ** ставте галочку на "Firebase Hosting"
4. Натисніть **"Register app"**
5. Скопіюйте конфігурацію (apiKey, authDomain, тощо)

## Крок 3: Оновлення firebase-config.js

Відкрийте файл `firebase-config.js` і замініть placeholder-и на ваші значення:

```javascript
const firebaseConfig = {
    apiKey: "ВАШ_API_KEY",
    authDomain: "ВАШ_PROJECT_ID.firebaseapp.com",
    projectId: "ВАШ_PROJECT_ID",
    storageBucket: "ВАШ_PROJECT_ID.appspot.com",
    messagingSenderId: "ВАШ_SENDER_ID",
    appId: "ВАШ_APP_ID"
};
```

## Крок 4: Увімкнення Google авторизації

1. В консолі Firebase перейдіть до **Authentication** (ліве меню)
2. Натисніть **"Get started"**
3. Виберіть **Google** зі списку провайдерів
4. Натисніть **"Enable"**
5. Виберіть email для підтримки проекту
6. Натисніть **"Save"**

## Крок 5: Створення бази даних Firestore

1. В консолі Firebase перейдіть до **Firestore Database** (ліве меню)
2. Натисніть **"Create database"**
3. Виберіть **"Start in test mode"** (для розробки)
4. Виберіть локацію серверу (europe-west1 для Європи)
5. Натисніть **"Enable"**

## Крок 6: Налаштування правил безпеки

В Firestore Database перейдіть на вкладку **"Rules"** і замініть на:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Натисніть **"Publish"**.

## Крок 7: Додавання домену (для GitHub Pages)

1. В консолі Firebase перейдіть до **Authentication** > **Settings**
2. Перейдіть на вкладку **"Authorized domains"**
3. Натисніть **"Add domain"**
4. Додайте: `tecak315.github.io`
5. Також додайте `localhost` якщо ще немає

## Готово!

Тепер SkladWeb готовий до використання з авторизацією Google.
