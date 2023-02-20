
import {config} from "./config";

function Amdahl(steps) { 

	if(Number.isInteger(steps)) { 
		this.steps = steps;
		this.stepNames = Array.from(Array(steps).keys(), (i) => "Step " + unescape('%' + (i+65).toString(16)));
		this.stepTimes = new Array(steps).fill(config.defaultStepTime);
		this.totalTime = steps * config.defaultStepTime;
		this.stepPercentages = new Array(steps).fill(parseFloat(100*(config.defaultStepTime/(steps*config.defaultStepTime))).toFixed(2));
		this.factors = new Array(steps).fill(parseFloat(1).toFixed(2));
	}

	this.calculateProcessTotalTime = function() { 
		this.totalTime = 0;
		for(let i=0; i<this.steps; i++) { 
			this.totalTime += this.stepTimes[i];
		}
	};

	this.calculateStepPercentages = function() { 
		for(let i=0; i<this.steps; i++) { 
			this.stepPercentages[i] = parseFloat(100*(this.stepTimes[i]/this.totalTime)).toFixed(2);
		}
	};

	this.getStepData = function() { 
		const stepData = [];
		for(let i=0; i<this.steps; i++) { 
			stepData[i] = { 
				id: i,
				name: this.stepNames[i],
				time: this.stepTimes[i],
				percentage: parseFloat(this.stepPercentages[i]),
				factor: parseFloat(this.factors[i]),
			};
		};
		return stepData;
	};

	this.updateSingleStepTimeData = function(step, newTime) { 
		if(this.steps < 1 || step > this.steps) return;
		//console.log("updating step " + step + " time from " + this.stepTimes[step] + " to " + newTime);
		this.stepTimes[step] = parseFloat(newTime);
		this.calculateProcessTotalTime();
		this.calculateStepPercentages();
		return this.getStepData();
	};

	this.updateSingleStepFactorData = function(step, newFactor) { 
		if(this.steps < 1 || step > this.steps) return;
		//console.log("updating step " + step + " factor from " + this.factors[step] + " to " + newFactor);
		this.factors[step] = parseFloat(newFactor);
		return this.getStepData();
	};

	this.updateSingleStepNameData = function(step, newName) { 
		if(this.steps < 1 || step > this.steps) return;
		//console.log("updating step " + step + " name from " + this.stepNames[step] + " to " + newName);
		this.stepNames[step] = newName;
		return this.getStepData();
	};

	this.updateStepTimes = function(newStepTimes) { 
		this.stepTimes = newStepTimes;
		this.calculateProcessTotalTime();
		this.calculateStepPercentages();
	};

	this.getTotalTime = function() { 
		return this.totalTime;
	};

};

export {Amdahl};
