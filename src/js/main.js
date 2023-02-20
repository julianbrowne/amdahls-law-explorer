
import "../scss/styles.scss";
import * as bootstrap from "bootstrap";
import "../css/style.css";

import {Amdahl} from "./amdahl";
import {DomTools} from "./dom-tools";
import {config} from "./config";
import {selectors} from "./selectors";

function AmdahlExplorer() { 

	this.calculator = null;
	this.domTools = null;
	this.parentElementSelector = selectors.defaultContainer;

	this.init = function(parentElementSelector) { 
		this.domTools = new DomTools(parentElementSelector);
		this.domTools.initUI(controlPanelHandler);
	};

	const updateStepDataUpdateHandler = function(amx) { 
		return function(event) { 

			const stepIndex = $(event.currentTarget).data().step;
			const stepNewValue = $(event.currentTarget).val();

			if(event.data.type==="time") { 
				const data = amx.calculator.updateSingleStepTimeData(stepIndex, stepNewValue);
				amx.domTools.updateProcessTable(data);
			}

			if(event.data.type==="name") { 
				const data = amx.calculator.updateSingleStepNameData(stepIndex, stepNewValue);
				amx.domTools.updateProcessTable(data);
			}

			if(event.data.type==="factor") { 
				const data = amx.calculator.updateSingleStepFactorData(stepIndex, stepNewValue);
				amx.domTools.updateProcessTable(data);
			}

		};
	}(this);

	const controlPanelHandler = function processDataUpdate(amx) { 
		return function createAmdahlCalculator(steps) { 
			if(!steps) return;
			if(!Number.isInteger(parseInt(steps))) return;
	        if(steps > config.maxSteps) { 
	            steps = config.maxSteps;
	            $("#steps-in-process").val(steps);
	        }
			amx.calculator = new Amdahl(parseInt(steps));
			amx.domTools.buildProcessStepsTable(
				amx.calculator.getStepData(),
				updateStepDataUpdateHandler
			);
		};
	}(this);

	this.start = function(parentElementSelector) { 
		this.init(parentElementSelector);
	};

};

export default new AmdahlExplorer();
