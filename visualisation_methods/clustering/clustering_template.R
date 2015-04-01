csv <- {0}
con <- textConnection(csv)
data <- read.csv(con)
close(con)
result <- f(data, fromJSON({1}), {2}, {3})