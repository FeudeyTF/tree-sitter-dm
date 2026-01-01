var/obj/test/item

/proc/test()

/obj/test/item/proc/test(var/item, item = 123, var/obj/test/test = 234)
	var/test
	test(test = 2, 2, /obj/test/item, "sas")

/proc/test()

/obj/item/test(item)

/obj/item/item
	var/test = "Test litteral"
	//test
	test = 123
// Test
/*
Test
*/
