//URL of the JSON file to retrieve and parse
const url = "nvdcve-1.1-recent.json";

//Initial range values for item numbers to retrieve
let curRangeMin = 1;
let curRangeMax = 5;
let curRange = 5;
let itemCount = 999; //Will be updated after first JSON call


function getJson(rangeStart, rangeStop)
{
    fetch(url)
        .then(res => res.json())
        .then(data => {
            //console.log(data.CVE_Items[0].cve.CVE_data_meta.ID);

            //updateTableRow(1, 0, data);

            itemCount = data.CVE_Items.length;

            if(rangeStop == itemCount)
            {
                ifLastPage();
            }
            else if(rangeStop == ceilToNearestRangeVal(itemCount) - curRange)
            {
                ifComingFromLastPage();
            }

            //Update the table with the current range of JSON items (-1 due to zero-indexing)
            updateTableVals(rangeStart - 1, rangeStop - 1, data);

            document.getElementById("curDisplay").innerHTML = `Displaying items ${curRangeMin} through ${curRangeMax} out of ${data.CVE_Items.length}`;
            document.getElementById("curDisplayBottom").innerHTML = `Displaying items ${curRangeMin} through ${curRangeMax} out of ${data.CVE_Items.length}`;

            console.log(` Displaying items ${curRangeMin} through ${curRangeMax} out of ${data.CVE_Items.length}`);


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

console.log(getCVENum(0));
console.log(getPublishedDate(0));
console.log(getLastModifiedDate(0));
console.log(getDescriptionLang(0));
console.log(getDescriptionValue(0));


function updateTableRow(rowNum, itemNumber, parsedJson)
{

    let nvdTable = document.getElementById("nvdTable");

    nvdTable.rows[rowNum].cells[0].innerHTML = getCVENum(itemNumber, parsedJson);
    nvdTable.rows[rowNum].cells[1].innerHTML = getPublishedDate(itemNumber, parsedJson);
    nvdTable.rows[rowNum].cells[2].innerHTML = getLastModifiedDate(itemNumber, parsedJson);
    nvdTable.rows[rowNum].cells[3].innerHTML = getDescriptionLang(itemNumber, parsedJson);
    nvdTable.rows[rowNum].cells[4].innerHTML = getDescriptionValue(itemNumber, parsedJson);
}

function updateTableVals(newRangeMin, newRangeMax, parsedJson)
{
    //To advance along table rows
    let rowCount = 1;

    for(let i = newRangeMin; i <= newRangeMax; i++)
    {
        updateTableRow(rowCount, i, parsedJson);

        console.log(`row ${rowCount} changed, item number ${i}. min is ${newRangeMin} and max is ${newRangeMax}`);

        //Go to next row
        rowCount++;
    }
}

function increaseRange()
{

    //If the next page has the full range of items
    if((curRangeMax + curRange) < itemCount)
    {
        //Add the range to the current min and max values
        curRangeMin += curRange;
        curRangeMax += curRange;

        //Get the JSON data for these items
        getJson(curRangeMin, curRangeMax);
    }
    //If we have reached the end of the item list
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

function decreaseRange()
{

    //Ensure that decreasing the range will not go out of scope
    if(curRangeMin - curRange > 0 && curRangeMax != itemCount)
    {
        curRangeMin -= curRange;
        curRangeMax -= curRange;

        getJson(curRangeMin, curRangeMax);


    }
    else if(curRangeMax == itemCount)
    {
        curRangeMin -= curRange;
        curRangeMax = ceilToNearestRangeVal(curRangeMax) - curRange;

        getJson(curRangeMin, curRangeMax);
    }
    else
    {
        alert("No previous records to display.")
    }
}

function ceilToNearestRangeVal(numToRound)
{

    console.log(numToRound);

    console.log(Math.ceil(Number(numToRound)/curRange) * curRange);



    return Math.ceil(Number(numToRound)/curRange) * curRange;
}

function goToItem(itemNumber)
{
    if(itemNumber <= 0)
    {
        alert("There is no item to display at that number.")
    }
    else if(itemNumber > itemCount) //item is out of range in the positive dir
    {
        alert("There is no item to display at that number.")
    }
    else if(Number.isInteger(Number(itemNumber)) == false)
    {
        alert("Please enter a valid integer.")
    }
    else
    {
        curRangeMax = ceilToNearestRangeVal(itemNumber);
        curRangeMin = (curRangeMax + 1) - curRange;

        console.log(curRangeMax);
        console.log(curRangeMin);

        if(itemCount > curRangeMin && itemCount < curRangeMax)
        {
            curRangeMax = itemCount;
        }

        console.log(itemCount);

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

function ifLastPage()
{
   
    let numRows = (curRangeMax - curRangeMin) + 1;

    switch(numRows)
    {
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

function ifComingFromLastPage()
{
    restoreRow("rowTwo");
    restoreRow("rowThree");
    restoreRow("rowFour");
    restoreRow("rowFive");
}