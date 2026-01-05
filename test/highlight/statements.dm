/proc/Test()
	for(var/i in 1 to 2)
		i++

	if(i > 10)
		return

	switch(i)
		if(1 to 10)
			print("1 to 10")
		if(11 to 100)
			print("11 to 100")

	while(TRUE)
		break
	
	world.log << "i: [i]"
