# RevealRemote
## Roles
A browser window can be controlled by one or more mobile devices running the app RevealRemote. The layer between the browser window and the mobile devices is running on Socket.IO, a Node.js library based on WebSockets technology.

- Browser window **(B)**
    - The browser window connects to the server application by a dynamically generated bookmarklet that the user can add to their bookmarks. The bookmarklet contains a state ID that the mobile devices must enclose in their handshake to the server in order to be able to control the window.
- Server application **(S)**
    - The server application maintains connections between the browser window and the mobile devices. Mobile devices can send events to the server application, which will be forwarded to the browser window if the state ID specified by the mobile devices concurs with one of a browser window.
- Mobile device **(M)**
    - The mobile device connects to the server application and performs a handshake containing a state ID. The server finds whether a currently active browser window has connected to the server with that same state ID and joins them together in a room.

## Event traffic
### M to S
Socket.IO namespace: "/presenter"

| Event name | Fields | Description                                                                                           |
|------------|--------|-------------------------------------------------------------------------------------------------------|
| control    | action | "action" must be a property of the global Reveal object.                                              |
| handshake  | roomId | "nickname" is used in personal notification messages and when letting spectators know someone joined. |

### S to M

| Event name             | Fields                | Description |
|------------------------|-----------------------|-|
| ok                     |                       | |
| not ok                 | errorType             | Handshake is rejected when a validation error occurs ("roomId" is not according to validation regex). |
| state                  | progress, slideNotes, presentationConnected | Emitted when the presentation sends the state event to the server, or when a presenter connects. In the latter case the values the presentation most recently emitted are used. |

### B to S
Socket.IO namespace: "/presentation"

| Event name    | Fields               | Description |
|---------------|----------------------|-------------|
| handshake     | roomId               |             |
| state         | progress, slideNotes |             |

### S to B

| Event name          | Fields    | |
|---------------------|-----------|-|
| ok                  | roomId    | B is added to a room defined by its roomId string. |
| not ok              | errorType | Handshake is rejected when a browser window is already connected or when a validation error occurs. |
| control             | action    | "action" must be a property of the global Reveal object. |
| presenter connected |           | To be emitted when a mobile device joins. |

## Fields
Validation will be applied on both client and server side.

| Field name    | Type   | Regular expression                        |
|---------------|--------|-------------------------------------------|
| action        | String | ^[a-zA-Z]{1,30}$                          |
| errorType     | String | ^validation&#124;duplicate&#124;notfound$ |
| roomId        | uuid   |                                           |
| progress      | Number |                                           |
| slideNotes    | String |                                           |