(function () {
    let currentDate = new Date();
    (async function () {
        try {
            let url = "https://api.formula1.com/v1/event-tracker";
            const request = new Request(url, {
                headers: new Headers({
                    'apikey': 'qPgPPRJyGCIPxFT3el4MF7thXHyJCzAP',
                    'locale': 'en'
                })
            })
            let response = await fetch(request);
            let text = await response.text();
            let f1RaceData = JSON.parse(text);
            // Sort race session dates by earliest to latest.
            f1RaceData.seasonContext.timetables.sort(function (a, b) {
                return new Date(a.startTime) - new Date(b.startTime);
            });
            for (let i = 0; i < f1RaceData.seasonContext.timetables.length; i++) {

                f1RaceData.seasonContext.timetables[i].gmtOffset.replace(':', '');
                let gmtOffset = "GMT" + f1RaceData.seasonContext.timetables[i].gmtOffset;

                let sessionDate = new Date(f1RaceData.seasonContext.timetables[i].startTime);
                // Convert time by adding timezone offset
                sessionDate = new Date(sessionDate + " " + gmtOffset);

                if (currentDate < sessionDate) {
                    displayNextRaceTime(f1RaceData.race.meetingOfficialName + " " + f1RaceData.seasonContext.timetables[i].description, sessionDate.toString(), "f1");
                    return;
                }
            }
        }
        catch (error) {
            displayError();
            console.log(error);
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
            displayError();
            console.log(error);
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

    function displayError() {
        const errorID = "error";
        let div = document.createElement("h2");
        div.textContent = "An error occurred while retrieving race results";
        div.style.color = "blue";
        div.style.textAlign = "center";
        div.style.padding = "20px";
        document.getElementById(errorID).appendChild(div);
    }
}());
