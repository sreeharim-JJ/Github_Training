/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 */
define([],
   
    function () {
        /**
         * Defines the Portlet script trigger point.
         * @param {Object} params - The params parameter is a JavaScript object. It is automatically passed to the script entry
         *     point by NetSuite. The values for params are read-only.
         * @param {Portlet} params.portlet - The portlet object used for rendering
         * @param {string} params.column - Column index forthe portlet on the dashboard; left column (1), center column (2) or
         *     right column (3)
         * @param {string} params.entity - (For custom portlets only) references the customer ID for the selected customer
         * @since 2015.2
         */
        const render = (params) => {
            let portlet = params.portlet
            portlet.title = "Leave Letter Form";
            let html =
            `
            <label><b>Employee Name</b></label><br>
            <input type = "text" id = "employeename" style="width:95%;padding:5px;"><br>
            <label><b>From Date</b></label><br>
            <input type = "date" id="date" style="width:50%;padding:5px;"><br>
            <label><b>To Date</b></label><br>
            <input type = "date" id="date" style="width:50%;padding:5px;"><br>
            <label><b>Leave Type</b></label><br>
            <select id = "rating" style="width:95%;padding:5px;">
            <option value = "" disabled selected> Select Leave Type </option>
            <option value = "1"> Casual Leave </option>
            <option value = "2"> Sick Leave </option>
            <option value = "3"> Annual Leave </option>
            </select><br>
            <label><b>Reason For Leave</b></label><br>
            <textarea id = "reasonforleave" style="width:95%;"></textarea><br><br>
            <button
            onclick="document.getElementById('message').innerHTML='Form submitted successfully!';"
            style="background-color:green;color:black;padding:12px 28px;border:none;border-radius:8px;">
            Submit
            </button>            
            <div id = "message" style="margin-top:10px;color:red;font-weight:bold;"></div>
            </div>
            <script>
            function submitFeedback(){
                document.getElementById('message').innerHTML = "Feedback submitted successfully! ";
            }
            </script>
 
 
           `;
           portlet.html = html
        }
 
           
        return {render}
 
    });

    