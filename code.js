//URL of the JSON file to retrieve and parse
const url = "nvdcve-1.1-recent.json";

//Initial range values for item numbers to retrieve
let curRangeMin = 1;
let curRangeMax = 5;
let curRange = 5;
let itemCount = 999; //Will be updated after first JSON call to accurately reflect the count

//Function to obtain the JSON and parse its data at specific range values
function getJson(rangeStart, rangeStop)
{
    //Fetch JSON at the local URL
    fetch(url)
        .then(res => res.json())
        .then(data => {
            
            //Obtain accurate itemCount
            itemCount = data.CVE_Items.length;

            //Ensure extra table rows are not displayed if we are on the last page and there are less items than the range
            if(rangeStop == itemCount)
            {
                ifLastPage();
            }
            //Ensure these table rows are restored if coming from the last page with fewer items
            else if(rangeStop == ceilToNearestRangeVal(itemCount) - curRange)
            {
                ifComingFromLastPage();
            }

            //Update the table with the current range of JSON items (-1 due to zero-indexing)
            updateTableVals(rangeStart - 1, rangeStop - 1, data);

            //Display what number items are being shown and the total count
            document.getElementById("curDisplay").innerHTML = `Displaying items <strong>${curRangeMin}</strong> through <strong>${curRangeMax}</strong> out of <strong>${data.CVE_Items.length}</strong>`;
            document.getElementById("curDisplayBottom").innerHTML = `Displaying items <strong>${curRangeMin}</strong> through <strong>${curRangeMax}</strong> out of <strong>${data.CVE_Items.length}</strong>`;
        })
        .catch((error) => {
            console.error(error);
        })
}


//Function to get the CVE Number of a specified JSON entry
function getCVENum(itemNumber, parsedJson)
{
    return parsedJson.CVE_Items[itemNumber].cve.CVE_data_meta.ID;
}

//Function to get Published Date of a specified JSON entry
function getPublishedDate(itemNumber, parsedJson)
{
    return parsedJson.CVE_Items[itemNumber].publishedDate;
}

//Function to get Last Modified Date of a specified JSON entry
function getLastModifiedDate(itemNumber, parsedJson)
{
    return parsedJson.CVE_Items[itemNumber].lastModifiedDate;
}

//Function to get the Description Language of a specified JSON entry
function getDescriptionLang(itemNumber, parsedJson)
{
    return parsedJson.CVE_Items[itemNumber].cve.description.description_data[0].lang;
}

//Function to get the Description Value of a specified JSON entry
function getDescriptionValue(itemNumber, parsedJson)
{
    return parsedJson.CVE_Items[itemNumber].cve.description.description_data[0].value;
}

//Function to update a table Row with its newly obtained JSON Data
function updateTableRow(rowNum, itemNumber, parsedJson)
{
    //Get the table from the HTML document
    let nvdTable = document.getElementById("nvdTable");

    //Update its cells with data from the JSON file
    nvdTable.rows[rowNum].cells[0].innerHTML = getCVENum(itemNumber, parsedJson);
    nvdTable.rows[rowNum].cells[1].innerHTML = getPublishedDate(itemNumber, parsedJson);
    nvdTable.rows[rowNum].cells[2].innerHTML = getLastModifiedDate(itemNumber, parsedJson);
    nvdTable.rows[rowNum].cells[3].innerHTML = getDescriptionLang(itemNumber, parsedJson);
    nvdTable.rows[rowNum].cells[4].innerHTML = getDescriptionValue(itemNumber, parsedJson);
}

//Function to update the table as a Whole with its JSON data
function updateTableVals(newRangeMin, newRangeMax, parsedJson)
{
    //To advance along table rows
    let rowCount = 1;

    //Loop through the range
    for(let i = newRangeMin; i <= newRangeMax; i++)
    {   
        //Update each row
        updateTableRow(rowCount, i, parsedJson);

        //Go to next row
        rowCount++;
    }
}

//Function to advance to the Next page by increasing the current range minimum and maximum
function increaseRange()
{

    //If the next page has the full range of items (5)
    if((curRangeMax + curRange) < itemCount)
    {
        //Add the range to the current min and max values
        curRangeMin += curRange;
        curRangeMax += curRange;

        //Get the JSON data for these items
        getJson(curRangeMin, curRangeMax);
    }
    //If we have reached the end of the item list and there are no more to obtain
    else if(curRangeMax == itemCount)
    {
        //Do not get the JSON data for these items
        alert("No further items from this point.")
    }
    //If the next page has LESS than the full range of items
    else
    {
        //Set max to the total # of items, and min to += the range
        curRangeMax = itemCount;
        curRangeMin += curRange;

        //Get the JSON data for these items
        getJson(curRangeMin, curRangeMax);
    }
}

//Function to go back to the Previous page by decreasing the current range minimum and maximum
function decreaseRange()
{
    //Ensure that decreasing the range will not go out of scope
    if(curRangeMin - curRange > 0 && curRangeMax != itemCount)
    {
        //Decrease range values
        curRangeMin -= curRange;
        curRangeMax -= curRange;

        //Obtain JSON data for this new range
        getJson(curRangeMin, curRangeMax);

    }
    //If the current maximum is the final item of the data
    else if(curRangeMax == itemCount)
    {
        //Decrease min range value as normal
        curRangeMin -= curRange;

        //Decrease max range value from the next highest range value (multiple of 5 in this case)
        curRangeMax = ceilToNearestRangeVal(curRangeMax) - curRange;

        //Obtain JSON data for this new range
        getJson(curRangeMin, curRangeMax);
    }
    //If decreasing the range will go out of scope
    else
    {
        alert("No previous records to display.")
    }
}

//Function to round to the next highest multiple of the range value
function ceilToNearestRangeVal(numToRound)
{
    return Math.ceil(Number(numToRound)/curRange) * curRange;
}

//Function to go to a specific item number when the user types it in
function goToItem(itemNumber)
{
    //Ensure that the typed number is a valid integer that isn't out of scope
    if(itemNumber <= 0)
    {
        alert("There is no item to display at that number.")
    }
    else if(itemNumber > itemCount)
    {
        alert("There is no item to display at that number.")
    }
    else if(Number.isInteger(Number(itemNumber)) == false)
    {
        alert("Please enter a valid integer.")
    }
    else
    {
        //If we are coming from the last page, restore rows
        if(curRangeMax != ceilToNearestRangeVal(curRangeMax))
        {
            ifComingFromLastPage();
        }

        //Get the minimum and maximum from this number
        curRangeMax = ceilToNearestRangeVal(itemNumber);
        curRangeMin = (curRangeMax + 1) - curRange;

        //If this number is on the last page of data, ensure the max isn't out of scope
        if(itemCount > curRangeMin && itemCount < curRangeMax)
        {
            curRangeMax = itemCount;
        }

        //Obtain JSON data for this new range
        getJson(curRangeMin, curRangeMax);
    }
}

//Function to delete a row in case we don't have the full range of items to display
function delRow(rowId)
{
    document.getElementById(rowId).innerHTML = "";
}

//Function to restore a row after deleting it
function restoreRow(rowId)
{
    document.getElementById(rowId).innerHTML = "<td></td><td></td><td></td><td></td><td id='descriptionCol'></td>";
}

//Function to temporarily delete extra rows if on the last page of data without a full range
function ifLastPage()
{
    
    //Get the number of rows that this page should have
    let numRows = (curRangeMax - curRangeMin) + 1;

    //Switch based on the number of rows it should have
    switch(numRows)
    {
        //Delete any unnecessary rows
        case 1:
            delRow("rowTwo");
            delRow("rowThree");
            delRow("rowFour");
            delRow("rowFive");
            break;
        case 2:
            delRow("rowThree");
            delRow("rowFour");
            delRow("rowFive");
            break;
        case 3:
            delRow("rowFour");
            delRow("rowFive");
            break;
        case 4:
            delRow("rowFive");
            break;
        default:
            break;
            
    }
    
}

//Function to restore any rows that were deleted when viewing the last page
function ifComingFromLastPage()
{
    restoreRow("rowTwo");
    restoreRow("rowThree");
    restoreRow("rowFour");
    restoreRow("rowFive");
}