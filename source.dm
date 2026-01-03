/obj/item/test/proc/Test()

/obj/item/test/proc/New()
	sleep()

/datum/test
	var/test
	test = 123
/obj/item/test/verb/new()
	. = ..()
	if(1)
		test()
		if(2)
			var/test = usr
			sleep()
			return 1
			//Test comment
		else
			var/test = 2

/datum/item/test/test()
	var/test = 123
