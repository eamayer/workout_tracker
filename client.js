
// const server = 'http://localhost:3000/'
const server =  'http://flip1.engr.oregonstate.edu:9546/';

// set up for initial table load and after edit, this reloads and re-populates the table
document.addEventListener("DOMContentLoaded", function() {

        //remove old table and crete blank table
        let oldTable = document.getElementById("workoutTable")
        oldTable.remove()
        let newTable = document.createElement("table")
        let tableDiv = document.getElementById("theTable")
        tableDiv.append(newTable)
        newTable.id = "workoutTable"


        // request data from server
        let ourRequest = new XMLHttpRequest();
        ourRequest.open('GET', server, true);
        ourRequest.setRequestHeader('Content-Type', 'application/json');
        ourRequest.onload = function () {
            if (ourRequest.status >= 200 && ourRequest.status < 400) {
                var ourData = JSON.parse(ourRequest.responseText).rows;

                function buildTable(data) {
                    var col = ['id', 'name', 'reps', 'weight', 'units', 'date'];
                    var table = document.getElementById("workoutTable");

                    // add the row headers from col list
                    var tr = table.insertRow(-1);
                    for (var k = 0; k < col.length; k++) {
                        var th = document.createElement("th");
                        th.innerHTML = col[k];
                        th.className += col[k];
                        tr.appendChild(th);
                    }

                    // add json data passed from server
                    for (var i = 0; i < data.length; i++) {
                        tr = table.insertRow(-1);
                        tr.id = data[i].id
                        for (var j = 0; j < col.length; j++) {
                            var tabCell = tr.insertCell(-1);
                            tabCell.className += col[j]
                            tabCell.textContent = data[i][col[j]];
                            if (tabCell.className === 'units') {
                                if (tabCell.textContent !== "1") {
                                    tabCell.textContent = "kgs";
                                } else {
                                    tabCell.textContent = "lbs";
                                }
                            } else {
                                tabCell.textContent = data[i][col[j]];
                            }
                            if (tabCell.className === 'date') {
                                let jsonDate = tabCell.textContent
                                tabCell.textContent = jsonDate.substring(5, 7) + "/" + jsonDate.substring(8, 10) + "/" + jsonDate.substring(0, 4);
                            }
                        }

                        // adding the delete button to end of each row
                        var rowDeleteId = "delete " + data[i][col[0]];
                        var deleteButton = document.createElement('button')
                        deleteButton.innerHTML = "Delete"
                        deleteButton.id += rowDeleteId
                        deleteButton.onclick = function () {
                            var id = this.id
                            return deleteThisRow(id)
                        }
                        tr.appendChild(deleteButton)

                        // adding the update button to the end of each row
                        var rowUpdateId = "update " + data[i][col[0]];
                        var updateButton = document.createElement('button')
                        updateButton.innerHTML = "Update"
                        updateButton.id += rowUpdateId
                        updateButton.onclick = function () {
                            let id = this.id
                            return updateThisRow(id)
                        }
                        tr.appendChild(updateButton)
                    }
                }

                buildTable(ourData);
            } else {
                console.log("network error: " + ourRequest.statusText);
            }
        }
            ourRequest.send()

    });


document.addEventListener('DOMContentLoaded', bindButtons);

        function bindButtons() {
            document.getElementById('submitInfo').addEventListener('click', function (event) {

                //verifies that the name of the exercise is filled out
                if (document.getElementById('name').value === "") {
                    alert("You did not fill in your name")
                }

                //sets up call to AJAX call to server to enter in new exercise
                let req = new XMLHttpRequest();
                let payload = {name: null, weight: null, reps: null, units: null, date: null};
                payload.name = document.getElementById('name').value;
                payload.weight = document.getElementById('weight').value;
                payload.reps = document.getElementById('reps').value;
                payload.date = document.getElementById('date').value;
                let units = document.getElementsByName('units');

                //converts units from lbs or kgs to boolean
                payload.units = function () {
                    if (units[0].checked === true) {
                        return 0;
                    } else {
                        return 1;
                    }
                }();

                req.open('POST', server, true);
                req.setRequestHeader('Content-Type', 'application/json');
                req.addEventListener('load', function () {
                    if (req.status >= 200 && req.status < 400) {
                        let response = JSON.parse(req.responseText).rows;
                        let length = response.length
                        let data = response[length - 1]

                        // column headers used for adding class name to each cell
                        var col = ['id', 'name', 'reps', 'weight', 'units', 'date'];

                        var table = document.getElementById("workoutTable");
                        var row = table.insertRow(-1);
                        row.id = data.id

                        for (var j = 0; j < col.length; j++) {
                            var tabCell = row.insertCell(-1);
                            tabCell.className += col[j];
                            tabCell.textContent = data[col[j]];
                            if (tabCell.className !== 'units') {
                                tabCell.textContent = data[col[j]];
                            } else {
                                if (tabCell.textContent !== "1") {
                                    tabCell.textContent = "kgs";
                                } else {
                                    tabCell.textContent = "lbs";
                                }
                            }
                            if (tabCell.className === 'date') {
                                let jsonDate = tabCell.textContent
                                tabCell.textContent = jsonDate.substring(5, 7) + "/" + jsonDate.substring(8, 10) + "/" + jsonDate.substring(0, 4);
                            }

                        }

                        //add delete button with unique ID for the row
                        var rowDeleteId = "delete " + data.id;
                        var deleteButton = document.createElement('button')
                        deleteButton.innerHTML = "Delete"
                        deleteButton.id += rowDeleteId
                        deleteButton.onclick = function () {
                            var id = this.id
                            return deleteThisRow(id)
                        }
                        row.appendChild(deleteButton)

                        //add update button wih unique id for the row
                        var rowUpdateId = "update " + data.id;
                        var updateButton = document.createElement('button')
                        updateButton.innerHTML = "Update"
                        updateButton.id += rowUpdateId
                        updateButton.onclick = function () {
                            var id = this.id
                            return updateThisRow(id)
                        }
                        row.appendChild(updateButton)
                    } else {
                        console.log("network error: " + req.statusText);
                    }
                });
                req.send(JSON.stringify(payload));
                event.preventDefault();
            });


            document.getElementById('editInfo').addEventListener('click', function (event) {
                //gets data from update form to pass to server
                let req = new XMLHttpRequest();
                let payload = {id: null, name: null, weight: null, reps: null, units: null, date: null};
                payload.id = document.getElementById("editRowID").value;
                payload.name = document.getElementById('editName').value;
                payload.weight = document.getElementById('editWeight').value;
                payload.reps = document.getElementById('editReps').value;
                payload.date = document.getElementById('editDate').value;
                payload.units = function () {
                    if (document.getElementById("editKgs").checked === true) {
                        return 0;
                    } else {
                        return 1;
                    }
                }();

                // sends data to the server
                req.open('PUT', server, true);
                req.setRequestHeader('Content-Type', 'application/json');
                req.addEventListener('load', function () {
                    if (req.status >= 200 && req.status < 400) {
                        document.getElementById('editTable').style.display = 'none';
                        document.getElementById('addNewExercise').style.display = 'block';
                        let oldTable = document.getElementById("workoutTable")
                        oldTable.remove()
                        let newTable = document.createElement("table")
                        let tableDiv = document.getElementById("theTable")
                        tableDiv.append(newTable)
                        newTable.id = "workoutTable"


                        // request data from server
                        let ourRequest = new XMLHttpRequest();
                        ourRequest.open('GET', server, true);
                        ourRequest.setRequestHeader('Content-Type', 'application/json');
                        ourRequest.addEventListener('load', function () {
                            if (req.status >= 200 && req.status < 400) {
                                var ourData = JSON.parse(ourRequest.responseText).rows;

                                //rebuild the table
                                function buildTable(data) {
                                    var col = ['id', 'name', 'reps', 'weight', 'units', 'date'];
                                    var table = document.getElementById("workoutTable");

                                    // add the row headers from col list
                                    var tr = table.insertRow(-1);
                                    for (var k = 0; k < col.length; k++) {
                                        var th = document.createElement("th");
                                        th.innerHTML = col[k];
                                        th.className += col[k];
                                        tr.appendChild(th);
                                    }

                                    // add json data passed from server
                                    for (var i = 0; i < data.length; i++) {
                                        tr = table.insertRow(-1);
                                        tr.id = data[i].id
                                        for (var j = 0; j < col.length; j++) {
                                            var tabCell = tr.insertCell(-1);
                                            tabCell.className += col[j]
                                            tabCell.textContent = data[i][col[j]];
                                            if (tabCell.className === 'units') {
                                                if (tabCell.textContent !== "1") {
                                                    tabCell.textContent = "kgs";
                                                } else {
                                                    tabCell.textContent = "lbs";
                                                }
                                            } else {
                                                tabCell.textContent = data[i][col[j]];
                                            }
                                            if (tabCell.className === 'date') {
                                                let jsonDate = tabCell.textContent
                                                tabCell.textContent = jsonDate.substring(5, 7) + "/" + jsonDate.substring(8, 10) + "/" + jsonDate.substring(0, 4);
                                            }
                                        }

                                        // adding the delete button to end of each row
                                        var rowDeleteId = "delete " + data[i][col[0]];
                                        var deleteButton = document.createElement('button')
                                        deleteButton.innerHTML = "Delete"
                                        deleteButton.id += rowDeleteId
                                        deleteButton.onclick = function () {
                                            var id = this.id
                                            return deleteThisRow(id)
                                        }
                                        tr.appendChild(deleteButton)

                                        // adding the update button to the end of each row
                                        var rowUpdateId = "update " + data[i][col[0]];
                                        var updateButton = document.createElement('button')
                                        updateButton.innerHTML = "Update"
                                        updateButton.id += rowUpdateId
                                        updateButton.onclick = function () {
                                            let id = this.id
                                            return updateThisRow(id)
                                        }
                                        tr.appendChild(updateButton)
                                    }
                                }
                                buildTable(ourData);
                            } else {
                                console.log("network error: " + req.statusText);
                            }
                        })
                        ourRequest.send()
                    } else {
                        console.log("network error: " + req.statusText);
                    }
                })
                req.send(JSON.stringify(payload));
                event.preventDefault();
            });
        }

// deletes row by passing the unique ID from the delete button through the server to delete the row.
// Hides the edit table and shows add new exercise table in the event the user decided to edit, didn't submit but
// then deletes a row. Edits are discarded.
function deleteThisRow(tableID) {
        let itemID = tableID.split(" ")[1]
        let payload = {id: itemID}
        let req = new XMLHttpRequest();

        req.open('DELETE', server, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load', function () {
            if (req.status >= 200 && req.status < 400) {
                document.getElementById(itemID).remove()
                document.getElementById('editTable').style.display = 'none';
                document.getElementById('addNewExercise').style.display = 'block';
            } else {
                console.log("network error: " + req.statusText);
            }
        });
        req.send(JSON.stringify(payload));
    }

// this is called when someone clicks the "edit info" button on a row.
// The "add new exercise" table is hidden and the "update data" table that is pre-populated with current row answers
 function updateThisRow(tableID) {
    let itemID = parseInt(tableID.split(" ")[1])    //note this is a string

     // document.getElementById('addNewExercise').style.display = 'none';
     document.getElementById('editTable').style.display = 'block';

     // Gets the data from the server to populate the edit form with existing values
     let request = new XMLHttpRequest();
     request.open('GET', server, true);
     request.setRequestHeader('Content-Type', 'application/json');
     request.addEventListener('load', function () {
         if (request.status >= 200 && request.status < 400) {
             var data = JSON.parse(request.responseText).rows;
             for (var i = 0; i < data.length; i++) {
                 if (data[i].id === itemID) {
                     let idValue = document.getElementById("editRowID")
                     idValue.value = data[i].id
                     let name = document.getElementById("editName")
                     name.value = data[i].name
                     let reps = document.getElementById("editReps")
                     reps.value = data[i].reps
                     let weight = document.getElementById("editWeight")
                     weight.value = data[i].weight
                     let date = document.getElementById("editDate")
                     let jsonDate = data[i].date;
                     date.value = jsonDate.substring(0, 10)
                     if (data[i].units === 0) {
                             let button = document.getElementById("editKgs")
                             button.checked = true
                     } else {
                             let button = document.getElementById("editLbs")
                             button.checked = true
                     }
                 }
             }
         } else {
             console.log("network error: " + request.statusText);
         }
     })
     request.send();
 }

