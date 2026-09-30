/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 */
define([], function () {

    function render(params) {

        var portlet = params.portlet;

        var now = new Date();
        var hour = now.getHours();

        var greeting = "";

        if (hour < 12) {
            greeting = "Good Morning";
        } else if (hour < 17) {
            greeting = "Good Afternoon";
        }
        else{
            greeting = "Good Evening";
        }

        portlet.title = "Company Announcement";

        portlet.html = `
        <div style="
            padding:20px;
            text-align:center;
            background: #6eece6;
            border-radius:10px;">

            <img src="https://td3111354.app.netsuite.com/core/media/media.nl?id=23926&c=TD3111354&h=JMDrOfNSAkEzhomevhUUoRy2Ls3Sl7yQJBgYUb2dQyQ98I_v&fcts=20260928214208&whence="
                 width="180"
                 height="100"/>

            <h2 style="color: #b01c2e;">
                ${greeting}
            </h2>

            <p>
                <strong>Current Date & Time:</strong><br/>
                ${now.toLocaleString()}
            </p>

            <div style="
                margin-top:15px;
                padding:12px;
                background:#e8f4fd;
                border-left:5px solid #0066cc;
                text-align:left;">
                <strong>Announcement:</strong><br>
                Welcome to NetSuite Dashboard. Have a productive day!
            </div>

        </div>`;
    }

    return {
        render: render
    };
});