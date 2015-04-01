f <- function(set, moes, clusn1, clusn2) {

	columns <- names(set)
	numeric_columns <- names(set[,sapply(set, is.numeric)])
	string_columns <- columns[!(columns %in% numeric_columns)]

	
	setOrd <- set[order(set$simulation_index),]
	setOrdToCluster <- setOrd[, moes]
	clusters <- kmeans(setOrdToCluster, clusn1)

	lst <- list()
	for(i in 1:clusn1) {
	
		indxs <- which(clusters$cluster %in% i)
		occurances_size = length(indxs)
		
		setOrdIndx <- setOrd[indxs,]
		setOrdSliced <- setOrdIndx[,moes]
		setOrdSlicedToCluster <- setOrdSliced
		slicedClusters <- try(kmeans(setOrdSlicedToCluster, clusn2), silent=TRUE)
		
		error = FALSE
		sub_lst <- list()
		if (class(slicedClusters) != "try-error") {
			for(j in 1:clusn2) {
				slicedIndxs <- which(slicedClusters$cluster %in% j)
				sub_occurances_size = length(slicedIndxs)
				slicedIndxsMapped <- indxs[slicedIndxs]
				subclusterRows <- setOrd[slicedIndxsMapped,]

				sub_ranges_lst <- list()
				for(clmn in numeric_columns) {
					sub_ranges_lst[[clmn]] <- c(min(subclusterRows[, clmn]), max(subclusterRows[, clmn]))
				}
				
				sub_direct_ranges_lst <- list()
				for(clmn in numeric_columns) {
					sub_direct_ranges_lst[[clmn]] <- max(subclusterRows[, clmn]) - min(subclusterRows[, clmn])
				}
				
				sub_mean_lst <- list()
				for(clmn in numeric_columns) {
					sub_mean_lst[clmn] <- mean(subclusterRows[, clmn])
				}

				sub_lquartile_lst <- list()
				for(clmn in numeric_columns) {
					sub_lquartile_lst[clmn] <- quantile(subclusterRows[, clmn])[[2]]
				}	
		
				sub_median_lst <- list()
				for(clmn in numeric_columns) {
					sub_median_lst[clmn] <- quantile(subclusterRows[, clmn])[[3]]
				}	

				sub_uquartile_lst <- list()
				for(clmn in numeric_columns) {
					sub_uquartile_lst[clmn] <- quantile(subclusterRows[, clmn])[[4]]
				}	

				sub_inter_quartile_ranges_lst <- list()
				for(clmn in numeric_columns) {
					sub_inter_quartile_ranges_lst[clmn] <- IQR(subclusterRows[, clmn])
				}	

				sub_variances_lst <- list()
				for(clmn in numeric_columns) {
					sub_variances_lst[clmn] <- var(subclusterRows[, clmn])
				}				
				
				sub_standard_deviations_lst <- list()
				for(clmn in numeric_columns) {
					sub_standard_deviations_lst[clmn] <- sd(subclusterRows[, clmn])
				}				
						
				sub_skewness_lst <- list()
				for(clmn in numeric_columns) {
					sub_skewness_lst[clmn] <- skewness(subclusterRows[, clmn])
				}				
				
				sub_kurtosis_lst <- list()
				for(clmn in numeric_columns) {
					sub_kurtosis_lst[clmn] <- kurtosis(setOrdIndx[, clmn])
				}
		
				sub_occurances_lst <- list()
				for(clmn in string_columns) {
					sub_occurances = table(subclusterRows[, clmn])
					sub_tmp <- list()
					for(el in names(sub_occurances)) {
						sub_tmp[[el]] <- sub_occurances[[el]]*100/sub_occurances_size
					}
					sub_occurances_lst[[clmn]] <- sub_tmp
				}
				
				sub_lst <- c(sub_lst, list(list(cluster = paste(i, 's', j, sep=""), 
												indexes = as.list(slicedIndxsMapped),
												ranges = sub_ranges_lst,
												direct_ranges = sub_direct_ranges_lst,
												means = sub_mean_lst,
												lower_quartiles = sub_lquartile_lst,	
												medians = sub_median_lst,
												upper_quartiles = sub_uquartile_lst,	
												inter_quartile_ranges = sub_inter_quartile_ranges_lst,			
												variances = sub_variances_lst,			
												standard_deviations = sub_standard_deviations_lst,
												skewness = sub_skewness_lst,
												kurtosis = sub_kurtosis_lst,
												occurances = sub_occurances_lst												
												)
										)
							)
			}
		} else {
			error = TRUE
		}
		
		ranges_lst <- list()
		for(clmn in numeric_columns) {
			ranges_lst[[clmn]] <- c(min(setOrdIndx[, clmn]), max(setOrdIndx[, clmn]))
		}

		direct_ranges_lst <- list()
		for(clmn in numeric_columns) {
			direct_ranges_lst[[clmn]] <- max(setOrdIndx[, clmn]) - min(setOrdIndx[, clmn])
		}
		
		mean_lst <- list()
		for(clmn in numeric_columns) {
			mean_lst[clmn] <- mean(setOrdIndx[, clmn])
		}
		
		lquartile_lst <- list()
		for(clmn in numeric_columns) {
			lquartile_lst[clmn] <- quantile(setOrdIndx[, clmn])[[2]]
		}
		
		median_lst <- list()
		for(clmn in numeric_columns) {
			median_lst[clmn] <- quantile(setOrdIndx[, clmn])[[3]]
		}	

		uquartile_lst <- list()
		for(clmn in numeric_columns) {
			uquartile_lst[clmn] <- quantile(setOrdIndx[, clmn])[[4]]
		}			

		inter_quartile_ranges_lst <- list()
		for(clmn in numeric_columns) {
			inter_quartile_ranges_lst[clmn] <- IQR(setOrdIndx[, clmn])
		}			
		
		variances_lst <- list()
		for(clmn in numeric_columns) {
			variances_lst[clmn] <- var(setOrdIndx[, clmn])
		}

		standard_deviations_lst <- list()
		for(clmn in numeric_columns) {
			standard_deviations_lst[clmn] <- sd(setOrdIndx[, clmn])
		}

		skewness_lst <- list()
		for(clmn in numeric_columns) {
			skewness_lst[clmn] <- skewness(setOrdIndx[, clmn])
		}

		kurtosis_lst <- list()
		for(clmn in numeric_columns) {
			kurtosis_lst[clmn] <- kurtosis(setOrdIndx[, clmn])
		}
		
		occurances_lst <- list()
		for(clmn in string_columns) {
			occurances = table(setOrdIndx[, clmn])
			tmp <- list()
			for(el in names(occurances)) {
				tmp[[el]] <- occurances[[el]]*100/occurances_size
			}
			occurances_lst[[clmn]] <- tmp
		}
		
		element <- list(cluster = i, 
						indexes = as.list(indxs),
						ranges = ranges_lst,
						direct_ranges = direct_ranges_lst,						
						means = mean_lst,
						lower_quartiles = lquartile_lst,
						medians = median_lst,
						upper_quartiles = uquartile_lst,
						inter_quartile_ranges = inter_quartile_ranges_lst,
						variances = variances_lst,
						standard_deviations = standard_deviations_lst,
						skewness = skewness_lst,
						kurtosis = kurtosis_lst,
						occurances = occurances_lst,
						subclusters = sub_lst
						)
		if(error) { element <- c(element, error = iconv(geterrmessage(),to="utf-8")) }
		lst <- c(lst, list(element))
	}
	# toJSON(lst)
	lst
}