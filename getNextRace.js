(function () {
    let currentDate = new Date();
    (async function () {
        try {
            let url = "f12019seasoncalendar.ics";
            let response = await fetch(url);
            let text = await response.text();

            const EVENTNUMBER = 1;
            const EVENTSTARTDATE = 3;
            const EVENTSUMMARY = 1;
            const EVENT_VALUE = 3;

            // Convert the ICS file to an object to read.
            let jCalData = ICAL.parse(text);
            let comp = new ICAL.Component(jCalData[2]);
            let season = comp.toJSON();

            for (let i = 0; i < season.length; i++) {
                // Get the next session time from ics file.
                let sessionDateTime = new Date(season[i][EVENTNUMBER][EVENTSTARTDATE][EVENT_VALUE]);
                // Get the next race name (and session type);
                let sessionName = season[i][EVENTNUMBER][EVENTSUMMARY][EVENT_VALUE];
                // Check session date against current date to see if it is the next race session.
                if (currentDate < sessionDateTime) {
                    displayNextRaceTime(sessionName, sessionDateTime.toString(), "f1");
                    break;
                }
            }
        }
        catch (error) {
            displayError(error);
        }
    })();

    (async function () {
        try {
            let url2 = "http://www.fiaformula2.com/ajax/SeasonSessions.ashx";
            let response = await fetch(url2);
            let text = await response.text();
            let f2seasonData = JSON.parse(text);

            for (let i = 0; i < f2seasonData.season.length; i++) {
                for (let j = 0; j < f2seasonData.season[i].sessions.length; j++) {
                    // Convert date stored in JSON to valid javascript date
                    let [date, time] = f2seasonData.season[i].sessions[j].racestartgmt.toString().split(' ');
                    let [day, month, year] = date.split('/');
                    let [hours, mins, secs] = time.split(':');
                    let dRaceSession = new Date(Date.UTC(year, month - 1, day, hours, mins, secs));
                    if (currentDate < dRaceSession) {
                        displayNextRaceTime("Formula 2 " + f2seasonData.season[i].name + " " + f2seasonData.season[i].sessions[j].sessionname, dRaceSession, "f2");
                        return;
                    }
                }
            }

        } catch (error) {
            displayError(error);
        }
    })();


    // Display next race in the Extension.
    function displayNextRaceTime(raceName, nextSessionTime, raceSeries) {
        let div = document.createElement("h2");
        div.setAttribute('style', 'white-space: pre;');
        div.textContent = raceName + "\r\n" + nextSessionTime + "\n";
        div.style.color = "red";
        div.style.textAlign = "center";
        div.style.padding = "20px";
        document.getElementById(raceSeries).appendChild(div);
    }

    function displayError(errorText) {
        let div = document.createElement("h2");
        div.textContent = errorText;
        div.style.color = "blue";
        div.style.textAlign = "center";
        div.style.padding = "20px";
    }
}());
