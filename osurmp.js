/*global $:false */
/*global chrome:false*/

/**
 *
 * 
 */

var exceptions = {};


//Insert a column with the ratings and corresponding professor pages for each professor from Ratemyprofessor.com

function appendOSUprof(exceptions) {

    // //Insert a column header
    // $('thead').find('tr').each(function() {
    //     $(this).find('th').eq(4).after('<th>Rate My Professor Score(s)</th>');
    // });
    
    // Insert RMP heading
    $('ul.osu-people-directory').find('li').each(function() {
        $(this).find('.km-email').after('<div class="osu-rmp"><h3>Rate My Professory Score(s)</h3></div>');
    });

    //Insert "space" for RMP info for each listed faculty member
    $('ul.osu-people-directory').find('li').each(function() {

        var professorName = $(this).find('h2').find('a').text();
        var URLprofessorName = professorName.replace(/ /g, '+');

        if(exceptions[professorName]) {

            findRatings(exceptions[professorName], professorName);
        } else {

            rmpsearch = 'http://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=The+Ohio+State+University&queryoption=HEADER&query=PROFESSORNAME&facetSearch=true'
            rmpsearch = rmpsearch.replace('PROFESSORNAME', URLprofessorName);
        }

        getProfessorExtension(rmpsearch, professorName);
    });
}
    
/*
Given an RMP search page, find the numerical extension that corresponds with the the professor's personal RMP page.
*/
function getProfessorExtension(searchPageURL, professorName){

    var xmlRequestInfo = {
        method: 'GET',
        action: 'xhttp',
        url: searchPageURL,
        professorName: professorName
    };

    chrome.runtime.sendMessage(xmlRequestInfo, function(data) {
        var responseXML, professorName, ratings;
        try {

            responseXML = data.responseXML;
            professorName = data.professorName;

            //Find the numerical extension that leads to the specific professor's RMP page.
            var professorURLExtension = $(responseXML).find('.listing:first').find('a:first').attr('href');

            //Check to make sure a result was found
            if (typeof professorURLExtension === 'undefined'){
                updateRMPinfo('?','?', professorName);//update RMP cells with empty information
            } else {
                var professorPageURL = 'http://www.ratemyprofessors.com' + professorURLExtension;
                ratings = findRatings(professorPageURL, professorName);
            }
        }
        catch(err) {
            updateRMPinfo('?', '?', professorName);//update RMP cells with empty information
        }       
    });
}

/*
Given the url of a specific professor:
Makes a JSON object containing an overall rating, helpfulness rating, clarity rating, and easiness rating.
Then makes a pass to change RMP cells to update each individual cell of the RMP column with this info.
*/
function findRatings(professorPageURL, professorName){
    var xmlRequestInfo = {
        method: 'GET',
        action: 'xhttp',
        url: professorPageURL,
        professorName: professorName
    };

    chrome.runtime.sendMessage(xmlRequestInfo, function(data) {

        var rating = {
            overall: -1,
            helpfulness: -1,
            clarity: -1,
            easiness: -1
        };
        var professorName, professorPageURL, responseXML;
        try {

            professorName = data.professorName;
            professorPageURL = data.url;
            responseXML = data.responseXML;

            //Find the numerical extension that leads to the specific professor's RMP page.
            rating.overall = $(responseXML).find('.grade').html();
            rating.helpfulness = $(responseXML).find('.rating:eq(0)').html();
            rating.clarity = $(responseXML).find('.rating:eq(1)').html();
            rating.easiness = $(responseXML).find('.rating:eq(2)').html();

            //document.write(responseXML);

            //Check to make sure a result was found
            if (parseInt(rating.overall) > 5 || parseInt(rating.overall) <= 0 || isNaN(rating.overall)){
                rating = '?';
            }

        }
        catch(err) {
            rating = '?';
        }

        //Update the new RMP column cells with the new information.
        changeRMPCells(professorPageURL, rating, professorName);
    });
}


/*
    Rename function to more appropriately reflect the action
    Most likely will update to have UL with li for RMP rating criteria 
*/
function updateRMPinfo(professorPageURL, rating, professorName){

    $('ul.osu-people-directory').find('li').each(function() {

        var professorCell = $(this).find('h2').find('a').text();
        // console.log(professorCell);
        // console.log(professorName);

        if (professorCell == professorName){

            if (professorPageURL != '?') {

                if (rating != '?' && typeof rating != 'undefined') {

                    $(this).find('h3').after(
                        'Overall: '+ rating.overall +
                        '\nHelpfulness: '+ rating.helpfulness +
                        '\nClarity: '+ rating.clarity +
                        '\nEasiness: '+ rating.easiness +
                        ' \n<a href="' + professorPageURL + '" target="_blank">More info</a>');
                } else {
                    $(this).find('h3').after(
                        '<p><a href="' + professorPageURL + '" target="_blank">Be the\nfirst to rate!</a></p>'
                    );
                }
            } else {
                $(this).find('h3').after('<p>>No page\nwas found.</p>');
            }
        }
    });
}