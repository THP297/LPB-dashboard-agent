let StatsMessageReceiver = (() => {

    let updateRealtimeStats = (data) => {
        // Update each stat item based on the data
        document.getElementById("available-count").textContent = data.Available || 0;
        document.getElementById("no-acd-count").textContent = data.NoACD || 0;
        document.getElementById("at-lunch-count").textContent = data.Lunch || 0;
        document.getElementById("callback-count").textContent = data.Callback || 0;
        document.getElementById("campaign-count").textContent = data.Campaign || 0;
        document.getElementById("outbound-count").textContent = data.Outbound || 0;
    };

    let subscribe = (client) => {
        let userId = "*"; // Default value
        
        client.subscribe(`/exchange/Monitor_Status_Agent/monitor_status_agent.${userId}`, (message) => {
            
            let body = JSON.parse(message.body);
            
            // Assuming the data format is an array, we'll use the first object for now
            if (Array.isArray(body) && body.length > 0) {
                updateRealtimeStats(body[0]);
            }

            message.ack({ id: message.headers['message-id'] });
        },{ ack: 'client-individual' });
    };

    return {
        subscribe,
    };
})();


let StatsMessageClient = (() => {
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
            StatsMessageReceiver.subscribe(client);
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
StatsMessageClient.init();
