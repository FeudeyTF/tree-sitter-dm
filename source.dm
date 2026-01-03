/obj/item/test/proc/Test()

/obj/item/test/proc/New()
	sleep()

/datum/test
	var/test
	test = 123
/obj/item/test/verb/new()
	. = ..()

	for(var/test in test)
		return
	if(1)
		test()
		if(2)
			for(var/test2 as anything in test)
				return
			var/test = usr
			sleep()
			return 1
			//Test comment
		else
			var/test = 2

/datum/item/test/test()
	var/test = 123
