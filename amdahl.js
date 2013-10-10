

if (typeof jQuery == 'undefined') {  
    alert("JQuery not present");
}
else {
    $(function() { 

        if( $("#amdahl").length === 0 )
            $("body").append('<div id="amdahl"></div>');

        $("#amdahl").append(' \
            <style> \
                label { \
                    display: inline-block; \
                    width: 240px; \
                } \
                input:disabled { \
                    background: #EEEEEE; \
                } \
                #amdahl { \
                    font-family: courier; \
                } \
                .center { \
                    text-align: center; \
                } \
                table { \
                    border-collapse: collapse; \
                    border-spacing: 0px; \
                    border: none; \
                } \
                th { \
                    vertical-align: top; \
                    margin: 0 5px; \
                    padding: 5px; \
                    border-right: 1px solid #DDDDDD; \
                    border-bottom: 1px solid #DDDDDD; \
                } \
                td { \
                    text-align: center; \
                    margin: 0; \
                    padding: 5px; \
                    position:relative; \
                    border-right: 1px solid #DDDDDD; \
                } \
                .summary { \
                    font-weight: bold; \
                    border-top: 1px solid #DDDDDD; \
                } \
            </style> \
            <div id="process"> \
                <b>Business Process</b><br/> \
                <label for="steps">Steps in Process</label> \
                <input type="text" name="steps" placeholder="steps" size="5" /> \
                <input type="button" value=" -build- " onclick="Amdahl.stepsTable()" />  \
                <input type="button" value=" -clear- " onclick="Amdahl.clearAll()" /><br/> \
            </div> \
        ');
    });
}

Amdahl = {};

Amdahl.stepsTable = function() {

    var inputSteps = $("input:text[name=steps]")
    var steps = inputSteps.val();

    if( steps === "" ) return;

    if( $("#steps").length > 0 ) $("#steps").remove();
    if( $("#report").length > 0 ) $("#report").remove();

    $("#amdahl").append(' \
        <div id="steps"> \
        </div> \
    ');

    if( isNaN(steps) ) { 
        $("#steps").append("<p>Steps in process must be a number</p>");
        return;
    }

    if( steps > 10 ) {
        steps = 10;
        inputSteps.val(10)
    };


    $("#steps").append(" \
        <p>Now, for each step in the process (A, B, C..) \
        update the length of time each step takes \
        to run now and set the factor of improvement you \
        expect for each step after a redesign - where 1.0 \
        means the process stays the same, 1.5 indicates the \
        process runs 50% quicker and 0.4 indicates that the \
        process degrades by 60% etc.</p>\
    ");

    Amdahl.processTable( $("#steps"), steps );

};

Amdahl.clearAll = function() {
    $("#steps").remove();
    $("#report").remove();
};

Amdahl.processTable = function(div, rows) { 

    if(rows === undefined) return;

    div.append('<table id="process-data">');

    $("#process-data").append(
        "<tr> \
            <th>ID</th> \
            <th>Step Name</th> \
            <th>Step Time</th> \
            <th>% of Process Time</th> \
            <th>Speed-Up Factor</th> \
        </tr>"
    );

    var defaultTime = 5;
    var defaultPerc = ((defaultTime / (defaultTime * rows)) * 100).toFixed(2);
    var defaultFact = 1;

    for(var i=0; i < rows; i++) { 
        $("#process-data").append(
              '<tr>'
                + '<td>'
                    + (i+1) + '</td>'
                + '<td>'
                    + '<input class="center" type="text" size="20" name="step_name[]" value="Step ' + unescape('%' + (i+65).toString(16)) + '" disabled>'
                + '</td>'
                + '<td>'
                    + '<input class="center" type="text" size="10" name="step_time[]" value="' + defaultTime + '" onchange="Amdahl.updateTotal()">'
                + '</td>'
                + '<td>'
                    + '<input class="center" type="text" size="10" name="step_perc[]" value="' + defaultPerc + '" disabled>'
                + '</td>'
                + '<td>'
                    + '<input class="center" type="text" size="10" name="step_fact[]" value="' + defaultFact + '">'
                + '</td>'
            + '</tr>'
        );
    }

    $("#process-data").append(
        '<tr>'
            + '<td class="summary">&nbsp;</td>'
            + '<td class="summary">Totals (Now)</td>'
            + '<td class="summary">'
                + '<input class="center" type="text" size="10" name="total_time" value="' + (rows * defaultTime) + '" disabled>'
            + '</td>'
            + '<td class="summary">'
                + '<input class="center" type="text" size="10" value="100%" disabled>'
            + '</td>'
            + '<td class="summary">'
                + '<input type="submit" value=" -report- " onclick="Amdahl.buildReport()">'
            + '</td>'
        + '</tr>'
    );

};

Amdahl.buildReport = function() { 

    var speedups = document.getElementsByName("step_fact[]");
    var changes = false;

    if( $("#report").length > 0 )
        $("#report").remove();

    $("#amdahl").append(' \
        <div id="report"> \
            <b>Report</b><br/> \
        </div> \
    ');

    for(i=0; i < speedups.length; i++) { 
        if(speedups[i].value != "1") { 
            changes = true;
            break;
        }
    }

    if(!changes) { 
        $("#report").append(
              "<p>All your speedup factors are set to 1</p>"
            + "<p>Your new elapsed process time will be the same</p>"
            + "<p>Try changing some of the factors in the table to values other than 1</p>"
        );
        return false;
    }

    var stepNames = document.getElementsByName("step_name[]");
    var stepTimes = document.getElementsByName("step_time[]");
    var stepFacts = document.getElementsByName("step_fact[]");
    var stepPercs = document.getElementsByName("step_perc[]");

    // pre-calculate some totals

    var totalFactor = 0;
    var contributions = [];
    var stepPercentages = [];
    var stepFactors = [];
    var oldElapsed = parseInt($("input:text[name=total_time]").val()).toFixed(3);
    for(var i=0; i < stepTimes.length; i++) { 
        stepPercentages[i] = (parseFloat(stepPercs[i].value) / 100).toFixed(3);
        stepFactors[i]     = (parseFloat(stepFacts[i].value)).toFixed(3);
        contributions[i] = (stepPercentages[i] / stepFactors[i]).toFixed(3);
        totalFactor += parseFloat(contributions[i]);
    }
    var newElapsed = (totalFactor * oldElapsed).toFixed(3)

    $("#report").append('<table id="report-data">');

    $("#report-data").append(
        "<tr> \
            <th>ID</th> \
            <th>Step Name</th> \
            <th>Original Time<br/>[T<sub>1</sub>]</th> \
            <th>Original % of Process Time<br/>[P<sub>1</sub>]</th> \
            <th>Speed-Up Factor<br/>[F]</th> \
            <th>Contribution<br/>[P<sub>1</sub>/F]</th> \
            <th>New Time<br/>[T<sub>2</sub>]</th> \
            <th>New % of Process Time<br/>[P<sub>2</sub>]</th> \
        </tr>"
    );

    for(var i=0; i < stepTimes.length; i++) { 
        var stepElapsed = (parseFloat(stepTimes[i].value)).toFixed(3);
        var newTime = (stepElapsed * (1/stepFactors[i]) ).toFixed(3);
        var newPerc = (newTime / newElapsed).toFixed(3);

        $("#report-data").append( 
            '<tr>'
                + '<td>' + (i+1) + '</td>'
                + '<td>' + stepNames[i].value + '</td>'
                + '<td>' + stepElapsed + '</td>'
                + '<td>' + stepPercentages[i] + '</td>'
                + '<td>' + stepFactors[i] + '</td>'
                + '<td>' + contributions[i] + '</td>'
                + '<td>' + newTime + '</td>'
                + '<td>' + newPerc + '</td>'
            + '</tr>'
        );
    }

    $("#report-data").append( 
        '<tr>'
            + '<td class="summary">&nbsp;</td>'
            + '<td class="summary">&nbsp;</td>'
            + '<td class="summary">' + oldElapsed + '</td>'
            + '<td class="summary">&nbsp;</td>'
            + '<td class="summary">&nbsp;</td>'
            + '<td class="summary">' + totalFactor.toFixed(3) + '</td>'
            + '<td class="summary">' + newElapsed + '</td>'
            + '<td class="summary">&nbsp;</td>'
        + '</tr>'
    );

    $("#report").append(
          "<p>Before the changes the process completed in "
        + oldElapsed
        + " minutes. </p>"
    );

    $("#report").append(
          "<p>The process will now complete in " 
        + newElapsed
        + " minutes (total new factor * old elapsed time). "
    );
};

Amdahl.updateTotal = function() {

    var stepTimes = document.getElementsByName("step_time[]");
    var stepTimesTotal = 0;
    for(var i=0; i < stepTimes.length; i++) { 
        if(!isNaN(stepTimes[i].value))
            stepTimesTotal += parseInt(stepTimes[i].value);
        else
            stepTimes[i].value = "5";
    }
    $("input:text[name=total_time]").val(stepTimesTotal);

    var stepPerc = document.getElementsByName("step_perc[]");
    for(var i=0; i < stepPerc.length; i++) { 
        var percVal = parseInt(stepTimes[i].value);
        var percNew = parseFloat(100 * (percVal/stepTimesTotal));
        stepPerc[i].value = percNew.toFixed(2);
    }

};