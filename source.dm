/obj/item/test/proc/Test()

/obj/item/test/proc/New()
	sleep()

/datum/test
	var/test
	test = 1244233234

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
		else
			var/test = 2
/datum/item/test/test()
	var/test = 123
/proc/test()
	var/sas = 123
	
/mutable_appearance/emissive_blocker

/mutable_appearance/emissive_blocker/proc/New()
