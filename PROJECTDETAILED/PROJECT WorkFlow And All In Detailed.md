
##### PART 1-HOME SCREEN 


Home Screen
![[Pasted image 20260406093216.png]]
Adding more pages in the Navbar will be good like the about section ,our clients,our services,Career pages ,product,FAQ and all Also in the right corner in the beside the sign up 
Add the Feature page also In that detailed feature should be there means Faq related to the ffeature should be there 


The The watch Demo if possible the Then make the video to make the Demo video 



AND MAKE SURE THE NAVBAR SHOULD BE THE SAME 


button only there should be the option for the multilanguage![[Pasted image 20260406093521.png]]

The Multilanguage website should be There and also make sure when we click on the across all the pages it should be seen 
Make sure that it sync up in all the pages avaialable in the project 



![[Pasted image 20260406102843.png]]
![[Pasted image 20260406102900.png]]
![[Pasted image 20260406102910.png]]
![[Pasted image 20260406102917.png]]
Make it is in the ruppees and the this should be match with all the subscription component made 
it should be one 
And make the here the detailed Subcription detailed should have and also make sure there will be the presonal user -Free and the other personal user the pro one means the po personal user ,and another one is the enterprise ,or say for the team ,also put the custom like contact us for more 
so after that the contact us page should be run in prefectly and make sure it is running perfect 
means be send that mail to the companies contactus mail id 

![[Pasted image 20260406103324.png]]


This above image is also good but need to have proper 
Make the actually the start 14 days free trial work make this seriously 
link this to the subscription means you can see that the for the free trial also they need to have to take the plan and then 14 days trials  will be start like other platforms doo


Add the razor pay make it fully working 

And make sure the no mocing data should be there and also not thje simulated version not be there 





##### PART 2-LOGIN PAGE 




![[Pasted image 20260406104021.png]]

The login page is good and it can make better if possible 
And make sure the The Okta login and the azure AD works means they can login  from the okta and the azure id 
Also if possible put the feature of the stay logged in and it should be actually working so stay logged in should be whole project 



The Below image is the of the eight card platform they have this kind of the login page if possible make like this but not exactly like this 
and also put the Having rouble?Help? 
also make sure the Having trouble and the help link works successfully 
Image should be of the according to our platform 
and dont remove the login with okta and the Azure ID
![[Pasted image 20260406104421.png]]


Can we add Google sign for the normal personal user only mena only they can logged in with thier google account 

The enterprise team can also loggin with the google but they need to put thier companies id and all 



Now make sure make in detailed Everything about the login page which i have said 




PART-3 SIGNUP
![[Pasted image 20260406105303.png]]


What i  think the signup page should only for the personal user not for the enterprise 
and also make sure the signup page is at the highest level of the frontend also and also for the  backend 



Now in the sign up page the navbar pages is not working 




PART- 4-After Register

This section is after i register as the personal user
![[Pasted image 20260406111958.png]]


mAKE  sure tthe scanning is running properly 
Make sure the Single card scanning works properly make the logic properly 

![[Pasted image 20260406112056.png]]


This is the second the Group Photo 
means the user  upload teh Multicard photo means it will be the single photo but that contains the multiple card photos 
like below 
![[IMG_20260327_173459517.jpg]]


And it can be possible that the user take photos of the multiple Card photo in the single photo and possible of the different lanugae will  be tthere of the different different  physical card  of the different languages 


The thing the egine should be that capability that it can scan the multi language also in the 100 percent correct way 

and make the list below it and in the table 




THERE IS ANother batch Uploads 
Page 
So the below is the Batch Upload Page 

![[Pasted image 20260406202422.png]]


And int he batch upload for the personla user means personal free user they should onlyupload 10 physical card photo 

And the group card the single card photo only
Means the personal free user can upload only 10 to process continuoulsy as the batch upload name means 

Another thing is that in the batch  upload the the group photo sacnner is showing so we dont need that 


And one thing that all the scanner list should saved in the contacts list 

The Group card photo in single card shpuld be extract the data and that data should be saved to the Contact list 
The Batch upload card photo shpuld be extract the data and that data should be saved to the Contact list |
The Single card photo shpuld be extract the data and that data should be saved to the Contact list |


below i am pasting the image in there  need to save the all the contact 



![[Pasted image 20260406203427.png]]



in this need to be saved 


Please Make sure this works suuccessfully 








Part 4

The below image or say the apge comes when i  am clicking on teh  calender from the sidebar from the personal free user |


make the calender fully working check for the errors
![[Pasted image 20260407012728.png]]



part 5



The below is the leaderboard  why the leader should there in the personal free plan and also in teh personal pro plan 


this feature should be for the Enterpise only 
![[Pasted image 20260407012850.png]]





part 6


![[Pasted image 20260407013142.png]]The above page is of the 

# 📅 Events & Campaigns Page

> **Route**: `/dashboard/events`  
> **Component**: `EventsPage.jsx` (160 lines)  
> **Access**: All authenticated users (user, business_admin, super_admin)

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Events Page allows you to organize your networking activities. Instead of having one giant list of contacts, you can create "Events" (like a conference, trade show, or a specific marketing campaign) and tag your scans to them. This helps you track which events brought in the most leads and keep your follow-ups organized.

**Key features**:
- **Event Creation**: Quickly set up a new event with a name, location, and date.
- **Lead Tracking**: See at a glance how many contacts were scanned at each event.
- **Status Indicators**: Visual cues for "active" vs "completed" events.
- **Quick Filtering**: One-click navigation to see all contacts belonging to a specific event.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `events` | `array` | List of events fetched from the backend |
| `isModalOpen` | `boolean` | Controls the visibility of the "Create Event" popup |
| `formData` | `object` | Temporary storage for new event inputs (name, location, date, type) |
| `isSubmitting` | `boolean` | Prevents double-submission during API calls |

### Key Functions
1. **`fetchEvents()`**: Retrieves the list of events from `GET /api/events` using the user's JWT token.
2. **`handleCreateEvent(e)`**: Submits the form data to `POST /api/events`. On success, it refreshes the list and closes the modal.
3. **Navigation**: Uses `react-router-dom`'s `Link` to navigate to the Contacts page with a query parameter (`?eventId=ID`).

### Lifecycle
```
Component Mounts
    → fetchEvents() called
    → Request to GET /api/events (with Auth header)
    → State 'events' updated with results
    → UI renders event cards with attendee counts
User clicks "Create Event"
    → Modal opens → Form input → Submit
    → POST /api/events (payload: name, location, date, type)
    → List re-fetched → Modal closed
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/events` | Retrieves all events associated with the user/workspace |
| `POST` | `/api/events` | Creates a new event record |

### SQL Logic (Conceptual)
The backend typically performs a `JOIN` or extra subquery to count contacts per event:
```sql
SELECT e.*, (SELECT COUNT(*) FROM contacts c WHERE c.event_id = e.id) as attendees_count 
FROM events e 
WHERE e.user_id = ?
```

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Provides the common sidebar and navigation |
| `auth.js` | Utility | Handles `getStoredToken()` for API requests |
| `Lucide Icons` | Library | Visual iconography (MapPin, Users, etc.) |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `ScanPage` | Users select an "Event" from this list when scanning cards |
| `ContactsPage` | Uses `eventId` query param from this page to filter results |
| `AnalyticsPage` | Uses event data to show performance by location/campaign |

---

## 📊 Database Tables Affected
| Table      | Operation      | Description                                   |
| ---------- | -------------- | --------------------------------------------- |
| `events`   | SELECT, INSERT | Primary table for storing event metadata      |
| `contacts` | SELECT (Count) | Used to display the number of leads per event |
|            |                |                                               |



make sure it is running properpy 








PART 7



![[Pasted image 20260407013428.png]]


Make sure the AI DRAFT is fully functional 

And also make the to works from end to end 
The below is the iamge 
Make sure this connected all the pages will be working fully 

![[Pasted image 20260407014139.png]]




part 9 
![[Pasted image 20260407014220.png]]


	The AI Coach taking the time to load 
	
	
	
	
	Below is the iamge of the 
	
	

Make ssute the all the Ai netwroking coach and all the thingis working proeperpy 
![[Pasted image 20260407014303.png]]
Make sure all the page which is the dependent works 




Anotehr 



This below pages also should workd




![[Pasted image 20260407014610.png]]

Please make sure the abve image is of tjhe to  the dependent and the independent 





now We have taken the Ai sequences 


![[Pasted image 20260407014707.png]]Make sure the below pagew which connected to each other that also works 


![[Pasted image 20260407014954.png]]




The Digital 

i am thinking that this design of the to make the digital card 


![[Pasted image 20260407015024.png]]







The below is the setting 

![[Pasted image 20260407015205.png]]


So make sure it works perfect and detailed 


![[Pasted image 20260407015329.png]]


the settomg is not working 




![[Pasted image 20260407105235.png|697]]


The above image opf the Contacts so in the contact while mouse clicking on the saved contact it nothing happen means it not open also not shown any thing by opening it should be shown like the full detaild of the card 
what the card about means summerize by the ai and and if possible through the internet search the card detaild will be search on the internet and scrap the data and give it in the table and  here the verification should be strong means what if the scrapping of the data from the internet will be like if the user's social media handle is there then what then it should get the correct social media handle if it find the other then it will be problematic 





![[Pasted image 20260407105726.png]]


The above image of the chat support 

now the support should have the entire project knowledge and if the use aks how to do and what to do and and all the thing related to the system platfrom it should get the answer using the gemini and the chatgpt 

make the chat support in detailed and it should be work in the personal pro version ,enterprise admin user 


![[Pasted image 20260407110113.png]]


Now instead of giving the 
**Duplicate Detected:** This contact (same name or email) already exists in your contacts list. You can still save it if you want a separate entry.


this should be the pop ui that tell this only 




![[Pasted image 20260408003020.png]]


So the above image is of the I outreach Sequences So now the thing i sthat when i create the button is workking and it is creating but when i clicking on the square block where the ANANT is written it is nothing happen 
it should be full function from the end to end 
Means it should i actually work like the Ai outreach Sequences 
If possible take the inspiration from the other platforms 



![[Pasted image 20260408003215.png]]


And what is the purpose of this AI magic Designer if it is not designing 
and also the credit is not being used when i saving to the identity 
and actually when you ai design magic click and it creates then the credit should be used 




![[Pasted image 20260408003403.png]]


Now the above image is of the platform feedback and it is sent successfully 

so the other thing is that for the personal user means personal free user it should have some contraint because it can happen that the user can abuse also in multilanguage 
so do consider that and work on it 


![[Pasted image 20260408004106.png]]



Why the AI Couch is there in the personal free version 


and make this fully functional




![[Pasted image 20260408004345.png]]


Mke this Fully Working 
means user can actually upload the photo or make the avatars means add the library of the avatar so the user can choose 

ths should means choosing the avatar should only be in the personal free aND also personal pro version 

another  thing is that the with the help of the gemini and the chatgpt api the generate teh avatar for them 




![[Pasted image 20260408004553.png]]



And make the security means make the two factor authentication actually work