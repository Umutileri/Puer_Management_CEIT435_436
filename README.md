# 📚 Puer Management – CEIT 435 / CEIT 436 Project

## ✨ Project Summary
[Visit Live Demo](https://umutileri.github.io/Puer_Management_CEIT435_436/) ✨
Puer Management is a platform for **project management and fair peer evaluation** designed for university student groups and instructors. It aims to transparently track project progress and evaluate team members' contributions using an objective, data-driven system.

**Core Goal:** To eliminate ambiguity in project management and ensure that every team member's contribution is scored fairly.

---

## 🚀 Key Features (Frontend View)

This version (V1) provides the static visual representation of the final user interface (UI) and core interaction points.

* **Dashboard:** An overview page that allows the user to instantly see their active projects, completed tasks, pending evaluations, and recent group activity.
* **Account Settings:** A tabbed interface where users can edit their personal details (Name), change their password, and view individual contribution metrics.
    * Contribution metrics include the task completion rate and a summary of peer evaluations.
* **Navigation Bar:** Quick access to the Dashboard, Projects, and Evaluation pages.
* **Authentication Pages:** Forms for user login (`login.html`) and new account creation (`register.html`).
* **Landing Page:** An informative page showcasing the application's key features and Frequently Asked Questions (FAQ).

---

## 💻 Technologies Used

This project has been developed using purely **static frontend** technologies to provide a modern and responsive user experience.

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Structure** | **HTML5** | Used to create the structure and content of all web pages. |
| **Styling** | **CSS3** | Used for custom styling and layout adjustments. |
| **Framework** | **Bootstrap 5.3** | Employed for fast design, professional appearance, and ensuring responsiveness using pre-built components. |
| **Interactivity** | **JavaScript** | Used for the functionality of Bootstrap components (e.g., toggling navigation, tab switching) and simple UI interactions. |
| **Icons** | **Bootstrap Icons** | The icon set used for visual symbols across the interface. |

---

## 🚧 Version Note (V1 - Static Frontend)

**Important Note:** The files in this repository represent the **V1 static frontend view** of the Puer Management application.

* These pages focus only on the design, layout, and responsiveness of the user interface.
* The current version **does not include any Backend, Database (PostgreSQL), or Python Flask** integration. Form submissions or button clicks are only simulated via static page navigation.
* Backend and API connections will be integrated in future releases.

---

## 🔮 Future Roadmap (Next Steps)

The following features and integrations are planned for V2 and beyond:

* **Backend Integration:** Connecting the frontend forms and dashboards to the Flask API and PostgreSQL database.
* **Projects/Tasks Page:** Implementing the dynamic Kanban-style task board and task assignment interface.
* **JavaScript Logic:** Adding core application logic, including dynamic data fetching and progress bar updates based on API responses.
