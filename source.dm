/obj/item/test/proc/Test()

/obj/item/test/proc/New()
	sleep()

/datum/test
	var/test
	test = 123
/obj/item/test/proc/new()
	. = ..()
	if(1)
		test()
		if(2)
			var/test = 1
			sleep()
			return 1//sas
		else
			var/test = 2

/datum/item/test/test()
	var/test = 123
