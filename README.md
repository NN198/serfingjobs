# 🔍 Job Scraper: Boolean ATS Aggregator

**Job Scraper** is a high-performance, containerized tool designed to find job listings directly from company career pages hosted on major Applicant Tracking Systems (ATS). By leveraging Boolean search logic and **SerpAPI**, it bypasses the noise of traditional job boards to find "hidden" roles directly at the source.

This project was built with efficiency in mind using **Claude Code** and is fully orchestrated with **Docker**.

---

## 🚀 Key Features

* **Multi-ATS Support:** Search Greenhouse, Lever, SmartRecruiters, Workday, BambooHR, Jobvite, iCIMS, JazzHR, and Workable simultaneously.
* **Boolean Search Logic:** Built-in `OR` logic for job roles and `AND` logic for status keywords.
* **Deep Filtering:** Refine results by specific skills (e.g., SEO, Analytics) and location via the Advanced Search panel.
* **Real-time Logs:** Monitor the scraping progress directly in your terminal to see results per site.
* **Data Export:** Download your curated job list as a CSV for easy tracking in your own CRM or spreadsheet.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
* **Docker & Docker Compose**
* A **SerpAPI Key** (Get one at [serpapi.com](https://serpapi.com/))

---

## 📦 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/NN198/serfingjobs.git
    cd serfingjobs
    ```

2.  **Configure Environment Variables**
    Create a `.env` file from the provided template:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and add your SerpAPI key and preferred port.

3.  **Run with Docker**
    Spin up the entire stack (Frontend, Backend, and Redis):
    ```bash
    docker compose up --build
    ```
    The app will be accessible at `http://localhost:3001`.

---

## 🖥️ How to Use

1.  **Configure Search:** Select your target Job Sites and enter Job Roles (e.g., "Cloud Architect").
    <p align="center">
    <img src="website-imgs/job scrapper_1.png" width="700"/>
    </p>
2.  **Add Keywords:** Toggle keywords like **Hiring**, **Apply**, or **Remote**.
  <p align="center">
    <img src="website-imgs/job scrapper_2.png" width="700"/>
    </p>
3.  **Advanced Filtering:** Use the "Advanced Search" section and click on the websites you'd like to retrieve job listings
  <p align="center">
    <img src="website-imgs/job scrapper_3.png" width="700"/>
    </p>

4.  **Monitor:** Watch the real-time terminal logs for unique results across platforms.
  <p align="center">
    <img src="website-imgs/job scrapper_4.png" width="700"/>
    Serf API limits can be set at this time it performs 30 searches for 4 sites
  <p align="center">
    <img src="website-imgs/job scrapper_5..png" width="700"/>
    </p>
    
5.  **Export:** Review the UI results and hit **Download CSV** to save your leads.
  <p align="center">
    <img src="website-imgs/job scrapper_6.png.png" width="700"/>
    </p>

---

## 🏗️ Tech Stack

* **Frontend:** React with Tailwind CSS
* **Backend:** Node.js
* **Caching/Queue:** Redis
* **Search Engine:** SerpAPI (utilizing specialized `site:` operators)
* **Orchestration:** Docker Compose
* **AI Collaborator:** Claude Code

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
