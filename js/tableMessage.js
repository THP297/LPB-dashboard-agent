let TableMessageReceiver = (() => {
    let subscribe = (client) => {
        let userId = "*"; // Default value

        client.subscribe(`/exchange/Dashboard_Agent/dashboard_agent.${userId}`, (message) => {
            let body = JSON.parse(message.body);
            console.log("table!!", body);

            // Call function to populate table with data
            populateTable(body);

            message.ack({ id: message.headers['message-id'] });
        }, { ack: 'client-individual' });
    };

    // Function to get current filter values
    let getFilterValues = () => {
        return {
            extension: document.getElementById('filter-extension').value.toLowerCase(),
            name: document.getElementById('filter-name').value.toLowerCase(),
            group: document.getElementById('filter-group').value.toLowerCase(),
        };
    };

    // Function to check if a row matches the filters
    let matchesFilters = (rowData, filters) => {
        const matchesExtension = rowData.Extension.toLowerCase().includes(filters.extension) || filters.extension === "";
        const matchesName = rowData.UserName.toLowerCase().includes(filters.name) || filters.name === "";
        const matchesGroup = rowData.GroupName.toLowerCase().includes(filters.group) || filters.group === "";
        return matchesExtension && matchesName && matchesGroup;
    };

    let populateTable = (data) => {
        // Get current filter values
        let filters = getFilterValues();
    
        // Get the table body element
        let tableBody = document.querySelector("#violation-table tbody");
    
        // Clear any existing rows
        tableBody.innerHTML = "";
    
        // Loop through the data and create table rows if they match the filters
        data.forEach(rowData => {
            if (matchesFilters(rowData, filters)) {
                let row = document.createElement("tr");
    
                // Calculate "Call Out UnAns" (outboundCalls - ansCalls)
                const callOutUnAns = rowData.outboundCalls - rowData.ansCalls;
    
                // Calculate average talktime (if inboundCalls > 0 to avoid division by zero)
                const avgTalktime = rowData.inboundCalls > 0 
                    ? calculateAvgTalkTime(rowData.totalTalk, rowData.inboundCalls) 
                    : "00:00:00";
    
                // Create and append table cells based on the data
                row.innerHTML = `
                    <td>${rowData.Extension}</td>
                    <td>${rowData.UserName}</td>
                    <td>${rowData.GroupName}</td>
                    <td>${rowData.lastStatusName}</td>

                    
                    <td>${rowData.ansCalls}</td> 
                    <td>${rowData.inboundCalls}</td>
                    <td>${rowData.outboundCalls}</td>
                    <td>${rowData.inboundTalk}</td>
                    <td>${rowData.outboundTalk}</td> 
                    <td>${rowData.inboundRing}</td> 
                    <td>${rowData.outboundRing}</td> 
                    <td>${rowData.totalRing}</td>
                    <td>${rowData.totalTalk}</td> 

                `;
    
                // Append the row to the table body
                tableBody.appendChild(row);
            }
        });
    };
    
    // Helper function to calculate average talk time from total talk and number of calls
    function calculateAvgTalkTime(totalTalk, numCalls) {
        const totalInSeconds = timeToSeconds(totalTalk);
        const avgInSeconds = Math.floor(totalInSeconds / numCalls);
        return secondsToTime(avgInSeconds);
    }
    
    // Helper functions to convert time formats
    function timeToSeconds(timeStr) {
        const [hours, minutes, seconds] = timeStr.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    }
    
    function secondsToTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    


    return {
        subscribe,
    };
})();


let TableMessageClient = (() => {
    let websocketUrl;
    // Determine the WebSocket URL based on the current hostname
    let hostname = window.location.hostname;
    if (hostname !== 'crm-lpbank-uat.dxws.io' && hostname !== '127.0.0.1') {
        websocketUrl = 'wss://uat-crmcskh.lpbank.com.vn:8050/ntf/ws';
    } else {
        websocketUrl = 'wss://crm-lpbank-uat.dxws.io/ntf/ws';
    }

    let client = Stomp.client(websocketUrl);
    client.heartbeat.outgoing = 10000;
    client.heartbeat.incoming = 0;
    let headers = {
        login: "admin",  // Correct header key  
        passcode: "Lvpb@1234",  // Correct header key
    };
    client.reconnect_delay = 1000;
    client.debug = (e) => {};

    let isReconnecting = false;

    let init = () => {
        client.connect(headers, (frame) => {
            console.log('Connected: ' + frame);
            isReconnecting = false;
            TableMessageReceiver.subscribe(client);
        }, (error) => {
            console.log('Connection error: ' + error);
            // scheduleReconnect();
        });
    };

    let scheduleReconnect = () => {
        if (isReconnecting) return;
        isReconnecting = true;
        console.log('Scheduling reconnect...');
        setTimeout(() => {
            console.log('Reconnecting...');
            init();
        }, client.reconnect_delay);
    };

    let send = (topic, message) => client.send(topic, {}, message);

    // Handle disconnection event
    client.onclose = () => {
        console.log('Connection lost. Scheduling immediate reconnect...');
        // scheduleReconnect(true);
    };

    return {
        init,
        send,
        getClient: () => client
    };
})();

// Initialize the connection
TableMessageClient.init();


document.getElementById('toggle-filters').addEventListener('click', () => {
    const filterForm = document.getElementById('filter-form');
    const toggleButton = document.getElementById('toggle-filters');

    // Toggle visibility of filter form
    if (filterForm.style.display === 'none' || filterForm.style.display === '') {
        filterForm.style.display = 'flex'; // Show the filters
    } else {
        filterForm.style.display = 'none'; // Hide the filters
    }
});

// Initially hide the filters and set button text to "Mở bộ lọc"
document.getElementById('filter-form').style.display = 'none';
