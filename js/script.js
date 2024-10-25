$(document).ready(function () {
    // Function to generate random violation data
    function generateViolationData() {
        const violationTypes = ["Không báo cáo", "Báo cáo trễ", "Bỏ lỡ Callback"];
        const groups = ["Nhóm A", "Nhóm B", "Nhóm C"];
        const shifts = ["Sáng", "Chiều", "Tối"];
        const users = ["Đại lý 1", "Đại lý 2", "Đại lý 3", "Đại lý 4", "Đại lý 5"];
        return {
            group: groups[Math.floor(Math.random() * groups.length)],
            user: users[Math.floor(Math.random() * users.length)],
            shift: shifts[Math.floor(Math.random() * shifts.length)],
            type: violationTypes[Math.floor(Math.random() * violationTypes.length)],
            details: `Chi tiết vi phạm ngẫu nhiên của ${users[Math.floor(Math.random() * users.length)]}`,
            action: "Xem chi tiết",
            violations: {
                modeDetails: [
                    { mode: "Có mặt", time: Math.floor(Math.random() * 60) + " phút" },
                    { mode: "No ACD", time: Math.floor(Math.random() * 60) + " phút" },
                    { mode: "Đang ăn trưa", time: Math.floor(Math.random() * 60) + " phút" }
                ],
                totalShiftTime: Math.floor(Math.random() * 300) + " phút",
                monthlyViolationCount: Math.floor(Math.random() * 10),
                totalMonthTime: Math.floor(Math.random() * 600) + " phút"
            }
        };
    }

    // Function to render 5 initial rows of violation data
    function renderInitialRows() {
        for (let i = 0; i < 5; i++) {
            const violationData = generateViolationData();
            $("#violation-table tbody").append(`
                <tr data-row-id="${i}">
                    <td>${violationData.group}</td>
                    <td>${violationData.user}</td>
                    <td>${violationData.shift}</td>
                    <td>${violationData.type}</td>
                    <td>${violationData.details}</td>
                    <td><button class="view-btn" data-violations='${JSON.stringify(violationData.violations)}' data-agent="${violationData.user}">${violationData.action}</button></td>
                </tr>
            `);
        }
    }

    // Function to update a random row with new violation data
    function updateRandomRow() {
        const rowId = Math.floor(Math.random() * 5); // Randomly select one of the 5 rows to update
        const newViolation = generateViolationData();

        // Update the content of the selected row
        $(`#violation-table tbody tr[data-row-id=${rowId}]`).html(`
            <td>${newViolation.group}</td>
            <td>${newViolation.user}</td>
            <td>${newViolation.shift}</td>
            <td>${newViolation.type}</td>
            <td>${newViolation.details}</td>
            <td><button class="view-btn" data-violations='${JSON.stringify(newViolation.violations)}' data-agent="${newViolation.user}">${newViolation.action}</button></td>
        `);
    }

    // Render the initial 5 rows
    renderInitialRows();

    // Simulate receiving new data and updating one row every second
    setInterval(function () {
        updateRandomRow();
    }, 1000); // Update a random row every 1 second

    // Handle button click to show detailed violation times (delegated event handler)
    $(document).on("click", ".view-btn", function () {
        const violations = $(this).data('violations');
        const agentName = $(this).data('agent');

        // Populate modal with violation details
        $("#modal-agent-name").text(agentName);

        // Clear and add new violation times
        $("#violation-times").empty();
        violations.modeDetails.forEach(detail => {
            $("#violation-times").append(`<li>${detail.mode}: ${detail.time}</li>`);
        });

        // Update total violation times and counts
        $("#total-shift-violation-time").text(violations.totalShiftTime);
        $("#monthly-violation-count").text(violations.monthlyViolationCount);
        $("#total-month-violation-time").text(violations.totalMonthTime);

        // Show the modal
        $("#violationModal").css("display", "flex").hide().fadeIn(); // Set display to flex before showing
    });

    // Close modal when clicking the close button
    $(".close-btn").click(function () {
        $("#violationModal").fadeOut();
    });
});


$(document).ready(function () {
    // Function to generate sample agent productivity and status data
    function generateAgentData() {
        return {
            shiftTotal: Math.floor(Math.random() * 100) + " tasks",
            inboundShift: Math.floor(Math.random() * 50) + " calls",
            campaignShift: Math.floor(Math.random() * 30) + " campaigns",
            callbackShift: Math.floor(Math.random() * 20) + " callbacks",
            monthTotal: Math.floor(Math.random() * 300) + " tasks",
            inboundMonth: Math.floor(Math.random() * 150) + " calls",
            campaignMonth: Math.floor(Math.random() * 90) + " campaigns",
            callbackMonth: Math.floor(Math.random() * 60) + " callbacks",
            violationDetails: "Vi phạm không báo cáo lúc 14:30",
            realtimeTotal: Math.floor(Math.random() * 500) + " phút"
        };
    }

    // Function to render the sample data
    function renderAgentData() {
        const agentData = generateAgentData();
        
        // Update HTML elements with the generated data
        $("#shift-total").text(agentData.shiftTotal);
        $("#inbound-shift").text(agentData.inboundShift);
        $("#campaign-shift").text(agentData.campaignShift);
        $("#callback-shift").text(agentData.callbackShift);
        $("#month-total").text(agentData.monthTotal);
        $("#inbound-month").text(agentData.inboundMonth);
        $("#campaign-month").text(agentData.campaignMonth);
        $("#callback-month").text(agentData.callbackMonth);
        $("#violation-details").text(agentData.violationDetails);
        $("#realtime-total").text(agentData.realtimeTotal);
    }

    // Call the function to render data when the page loads
    renderAgentData();

    // Simulate new data updates every 5 seconds
    setInterval(renderAgentData, 5000);
});
