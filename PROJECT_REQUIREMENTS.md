**\#Project Overview:**

A web Application that helps B2B marketers track Linkedin Outreach campaigns and automatically update invitation acceptance status using Gmail Integration. 

**Problem Statement:**

Professionals conducting Linkedin outreach often send dozens or hundreds of connection request but struggle to track:

1\. How many leads have been identified  
2\. How many connection request sent  
3\. How many invitations have been accepted  
4\. Which leads require followup  
5\. Overall outreach performance

**Project Goal:**

Build a web application that helps users manage and track linkedin outreach activities. The application should provide a centralized dashboard for managing leads and automatically update invitation acceptance status through email integration.

Version 1:

User Authentication: Users should be able to   
1\. Sign in using google account  
2\. Access only their own outreach data

## **Lead Management**

Users should be able to:

* Add new leads  
* Edit lead information  
* Delete leads  
* Search leads  
* Filter leads by status

---

## **Lead Information Fields**

Each lead should contain:

* Full Name  
* Company Name  
* Job Title / Designation  
* LinkedIn Profile URL  
* Status  
* Notes  
* Date Added

---

# **Outreach Pipeline**

The application should support the following stages:

1. Lead Added  
2. Invitation Sent  
3. Accepted  
4. Message Sent  
5. Replied  
6. Opportunity Created

---

# **Dashboard Metrics**

The dashboard should display:

## **Lead Metrics**

* Total Leads  
* New Leads Added

## **Outreach Metrics**

* Invitations Sent  
* Pending Invitations  
* Accepted Invitations

## **Messaging Metrics**

* Messages Sent  
* Replies Received

## **Performance Metrics**

* Acceptance Rate

Acceptance Rate Formula:

Accepted Invitations / Invitations Sent × 100

---

# **Gmail Integration**

## **Objective**

Automatically detect when a LinkedIn invitation has been accepted.

## **Workflow**

1. User sends invitation through LinkedIn.  
2. LinkedIn sends acceptance email.  
3. Application reads Gmail notifications.  
4. Application identifies accepted invitation.  
5. Lead status is updated automatically to "Accepted".

---

# **Database Structure**

Collection: leads

Fields:

* id  
* userId  
* fullName  
* company  
* designation  
* linkedinUrl  
* status  
* notes  
* invitationSentDate  
* acceptedDate  
* messageSentDate  
* replyDate  
* createdAt  
* updatedAt

---

# **Technology Stack**

Frontend:

* Next.js  
* TypeScript  
* Tailwind CSS

Backend:

* Firebase Authentication  
* Firebase Firestore

Hosting:

* Vercel

AI Development Tools:

* Cursor  
* Claude

---

# **Success Criteria**

The MVP will be considered successful if users can:

1. Log in with Google  
2. Add leads  
3. Track outreach stages  
4. View outreach statistics  
5. Automatically detect accepted invitations via Gmail  
6. Monitor outreach performance through a dashboard

---

# **Future Enhancements**

Version 2:

* Follow-up reminders  
* Email notifications  
* AI-generated outreach messages  
* Advanced analytics  
* Browser extension

Version 3:

* Team collaboration  
* CRM integrations  
* Lead enrichment  
* Campaign management  
* Multi-user workspaces

