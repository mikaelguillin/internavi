## 1\. Landing Page: Step 1 - Choose Study Level

This page focuses on the primary guidance flow, using a clean, uncluttered layout.

### Screen Description

  * **Fixed Header:** A simple, narrow fixed bar (light blue background). On the left: **Internavi Logo** (in dark blue). On the right: **Explore Schools** (Button), **Scholarship Help** (Link), **Visa Guidance** (Link), and a small **Login** Icon/Button.
  * **Hero Section:** Dominant, large heading ("Start Your U.S. University Journey") and short tagline.
  * **Study Level Section:** A central area with three distinct **Shadcn Card** components side-by-side: **High School**, **Undergraduate**, and **Graduate**.
      * Each card uses a light blue gradient background, a large, friendly icon (E. Design & Experience Notes), and a prominent **Shadcn Button** (e.g., "Select Undergraduate") at the bottom.
  * **Action:** Clicking a card triggers a **Shadcn Dialog/Modal** to transition to Step 2.

-----

## 2\. Quiz Flow: Step 2 - Choose Path

This screen uses the split layout and introduces the design pattern for the interactive quiz.

### Screen Description

  * **Header:** Fixed header remains the same.
  * **Path Selection:** A **split layout** with two large **Shadcn Card** components, centrally focused:
      * **Card 1 (Left): "Find My Perfect Match" (Quiz Path)**. Description text: "Take a 2-minute quiz to find the schools that best match your preferences." Prominent blue Call-to-Action button: **"Start Quiz"**.
      * **Card 2 (Right): "I'm Not Sure Yet, Let Me Explore" (Browse Path)**. Description text: "Skip the quiz and browse all available schools." Outlined secondary button: **"Browse All"**.
  * **Quiz Progress (On Quiz Start):** Once the quiz starts, the main content area changes to a form. A **Shadcn Progress** bar appears at the top (e.g., 20% complete) with text "Question 1 of 5: Intended Major."

-----

## 3\. Explore Schools Page: Sticky Filtering

This screen demonstrates how the sticky navigation works to manage a large dataset.

### Screen Description

  * **Layout:** A two-column main layout, achieved using Tailwind CSS.
  * **Fixed Header:** Remains consistent.
  * **Left Column (Sticky Sidebar):** This column uses **Tailwind's `position: sticky`** to keep the filtering controls fixed as the user scrolls the school list. It contains:
      * **Filters:** Dropdowns/Selects (using Shadcn's `Select` or `Input`) for **State, Tuition, Acceptance Rate,** and **% of International Students**.
      * **Sorting:** Radio buttons or a single select for **Sort by Ranking** or **Affordability**.
  * **Right Column (Scrollable Content):** The main content area lists the schools in a responsive grid.
      * **School Cards:** Each school listing is a rich **Shadcn Card**, featuring the school name, image, tuition range, and the two action buttons: **"Learn More"** and **"Save This School."**

The **Progress component from Shadcn UI** is excellent for tracking the user's position through the quiz [How to Build a Multi Step Form with Shadcn UI and React Hook Form](https://www.google.com/search?q=https://www.youtube.com/watch%3Fv%3DFjI5j0xW2s0), which will reduce cognitive load and improve completion rates.