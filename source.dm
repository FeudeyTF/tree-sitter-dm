var/obj/test/item

/proc/test()

/obj/test/item/proc/test(var/item, item = 123, var/obj/test/test = 234)
	var/static/obj/test
	test(test = 2, 2, /obj/test/item, "sas")
	if(test() > 1)
		return 2
	return 1
/proc/test()

/obj/item/test(item)

/obj/item/item
	var/static/obj/test/item
	var/static/test = "Test litteral"
	test = 123
// Test
/*
Test
*/
