
var Amdahl = (function($) { 

    var maxSteps = 15;
    var defaultStepTime = 5;
    var defaultFactor = 1;
    var businessProcessDescriptionSelector = "#business-process-description";
    var instructionsContainer = "#instructions-container";
    var businessProcessStepsContainer = "#business-process-steps-container";
    var businessProcessStepsBody = "#business-process-steps";
    var businessProcessReportContainer = "#business-process-report-container";
    var businessProcessReportBody = "#business-process-report";

    var instructions = "For each step in the process (Step A, Step B, ..) \
        update the length of time each step takes (Step Time)             \
        to run now and set the factor of improvement (Speed-up Factor)    \
        you expect for each step after a redesign (where a factor of 1.0  \
        means the process stays the same, 1.5 indicates the process runs  \
        50% quicker, and 0.4 indicates the process degrades by 60% etc.";

    function clearResults() { 
        $(instructionsContainer).empty();
        $(businessProcessStepsBody).empty();
        $(businessProcessStepsContainer).hide()
        $(businessProcessReportBody).empty()
        $(businessProcessReportContainer).hide();
    }

    function buildTextInput(name, value, disabled, onchange) { 
        var inp = $("<input>")
            .attr("type", "text")
            .attr("value", value)
            .attr("name", name);

        if(disabled!==undefined && disabled!==false) { 
            inp.prop("readonly", true);
        }

        if(onchange!== undefined) { 
            inp.on("change", function(e) { onchange(); });
        }

        return inp;
    }

    function buildStepsTable() { 

        var stepsInput = $("#steps-in-process")
        var numberOfSteps = stepsInput.val();

        if(numberOfSteps === "") { return; }
        if(isNaN(numberOfSteps)) { return; }

        if(numberOfSteps > maxSteps) { 
            numberOfSteps = maxSteps;
            stepsInput.val(numberOfSteps);
        };

        clearResults();

        buildProcessStepsTable(numberOfSteps);
    }

    function buildProcessStepsTable(rows) { 

        $(businessProcessStepsContainer).show();
        $(instructionsContainer).append($("<p>").html(instructions));

        var target = $(businessProcessStepsBody);

        if(rows === undefined) return;

        var table = $("<table>")
            .addClass("table")
            //.addClass("table-striped")
            .attr("id", "process-data");

        target.append(table);

        var tableHeaderRow = $("<tr>");
        tableHeaderRow.append($("<th>").html("ID"));
        tableHeaderRow.append($("<th>").html("Step Name"));
        tableHeaderRow.append($("<th>").html("Step Time (mins)"));
        tableHeaderRow.append($("<th>").html("% of Process Time"));
        tableHeaderRow.append($("<th>").html("Speed-Up Factor"));

        table.append(tableHeaderRow);

        var defaultPerc = ((defaultStepTime / (defaultStepTime * rows)) * 100).toFixed(2);

        for(var i=0; i < rows; i++) { 
            var tableDataRow = $("<tr>");
            tableDataRow.append($("<td>").html((i+1)));
            tableDataRow.append($("<td>").html(buildTextInput("step_name[]","Step " + unescape('%' + (i+65).toString(16)))));
            tableDataRow.append($("<td>").html(buildTextInput("step_time[]", defaultStepTime, false, updateTotal)));
            tableDataRow.append($("<td>").html(buildTextInput("step_perc[]", defaultPerc, true)));
            tableDataRow.append($("<td>").html(buildTextInput("step_fact[]", defaultFactor)));
            table.append(tableDataRow);
        }

        var tableSummaryRow = $("<tr>");
        tableSummaryRow.append($("<td>").html("&nbsp;"));
        tableSummaryRow.append($("<td>").html("Totals (Now)"));
        tableSummaryRow.append($("<td>").html(buildTextInput("total_time", (rows * defaultStepTime), true)));
        tableSummaryRow.append($("<td>").html(buildTextInput("total_total", "100%", true)));

        var reportButton = $("<button>")
            .html("report")
            .addClass("btn")
            .addClass("btn-primary")
            .on("click", buildReport);

        tableSummaryRow.append($("<td>").html(reportButton));
        table.append(tableSummaryRow);

    }

    function buildReport() { 

        var speedups = document.getElementsByName("step_fact[]");
        var changes = false;

        $(businessProcessReportContainer).show();
        $(businessProcessReportBody).empty();

        for(i=0; i < speedups.length; i++) { 
            if(speedups[i].value != "1") { 
                changes = true;
                break;
            }
        }

        if(!changes) { 
            $(businessProcessReportBody).append(
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

        $(businessProcessReportBody).append('<table id="report-data" class="table">');

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

        $(businessProcessReportBody).append(
              "<p>Before the changes the process completed in "
            + oldElapsed
            + " minutes. </p>"
        );

        $(businessProcessReportBody).append(
              "<p>The process will now complete in " 
            + newElapsed
            + " minutes (total new factor * old elapsed time). "
        );
    }

    function updateTotal() { 

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

    }

    return { 

        init: function() { 
            $(businessProcessStepsContainer).hide();
            $(businessProcessReportContainer).hide();
            $("#buildTable").on("click", function(e) { 
                e.preventDefault(); 
                buildStepsTable();
            });
            $("#clear").on("click", function(e) { 
                e.preventDefault(); 
                clearResults();
            });
        }

    }

}(jQuery));
