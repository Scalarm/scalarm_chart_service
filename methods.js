var methods = ["interaction", "pareto", "3d"];

var groups = 
	{
		"group": {
			name: "Analyses methods",
			methods: [
				{
	                name: "Histograms",
	                id: "experiment-analysis-modal",
	                em_class: "histogram-analysis",
	                image: "/chart/images/material_design/histogram_icon.png",
	                description: "Histograms analysis"
	            },{
	                name: "Regression trees",
	                id: "experiment-analysis-modal",
	                em_class: "rtree-analysis",
	                image: "/chart/images/material_design/regression_icon.png",
	                description: "Regression trees analysis"
	            },{
	                name: "Scatter plots",
	                id: "experiment-analysis-modal",
	                em_class: "bivariate-analysis",
	                image: "/chart/images/material_design/scatter_icon.png",
	                description: "Bivariate analysis - scatter plot"
	            }
			]
		}
	};

module.exports = {
	methods: methods,
	groups: groups
}