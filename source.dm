#define TEST 123
GLOBAL_VAR(/obj/test)
/obj/item/test/proc/Test()

/obj/item/test/proc/New()
	sleep()

/datum/test
	var/test
	test = 1244233234

/obj/item/test/verb/new()
	. = ..()
	test.sas.test["sas"] = 123
	for(var/test in test)
		return
	while(TRUE)
		break
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
	if(1 to 2)
		return 12

/datum/item/test/test()
	var/test = ""
/proc/test()
	var/sas = 123
	
/mutable_appearance/emissive_blocker

/mutable_appearance/emissive_blocker/proc/New()
