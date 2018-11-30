---
layout: post
title:  "[json-c] Tutorial part 2: Types"
date:   2014-10-28
tags:   tutorial json-c
---
Two major categories of types exists in json-c, basic and composed.

# Basic types

Namely boolean, int32, int64, double and string. All of those types have a new and a get method:

{% highlight C %}
struct json_object * json_object_new_boolean(json_bool b);
json_bool json_object_get_boolean(struct json_object *obj);

struct json_object * json_object_new_int(int32_t i);
int32_t json_object_get_int(struct json_object *obj);

struct json_object * json_object_new_int64(int64_t i);
int64_t json_object_get_int64(struct json_object *obj);

struct json_object * json_object_new_double(double d);
struct json_object * json_object_new_double_s(double d, const char *ds);
double json_object_get_double(struct json_object *obj);

struct json_object * json_object_new_string(const char *s);
struct json_object * json_object_new_string_len(const char *s, int len);
const char * json_object_get_string(struct json_object *obj);
int json_object_get_string_len(struct json_object *obj);
{% endhighlight %}

> Note: don't mix-up `json_object_get_string()` and `json_object_to_json_string()`,
> `json_object_get_string()` should be used only to retrieve a string and the second only to print a whole `json_object`.

`json_object_new_double_s()` allows a much more accurate representation of the double.

`json_object_new_string_len()` create a new json_object from the supplied string, the buffer size for the string is of size `len` (with `str[len+1] = '\0'`).

# Composed types

Composed types are arrays and objects in json, and can contain every combination of types you can think of.

{% highlight C %}
struct json_object * json_object_new_array(void);
struct array_list * json_object_get_array(struct json_object *obj);
int json_object_array_length(struct json_object *obj);
void json_object_array_sort(struct json_object *jso, int(*sort_fn)(const void *, const void *));
int json_object_array_add(struct json_object *obj, struct json_object *val);
int json_object_array_put_idx(struct json_object *obj, int idx, struct json_object *val);
struct json_object * json_object_array_get_idx(struct json_object *obj, int idx);

struct json_object * json_object_new_object(void);
struct lh_table * json_object_get_object(struct json_object *obj);
int json_object_object_length(struct json_object *obj);
void json_object_object_add(struct json_object *obj, const char *key, struct json_object *val);
json_bool json_object_object_get_ex(struct json_object *obj, const char *key, struct json_object **value);
void json_object_object_del(struct json_object *obj, const char *key);
#define json_object_object_foreach(obj, key, val)
{% endhighlight %}

I never actually used `json_object_get_array()` and `json_object_get_object()`, it's unlikely you will ever have to...
`json_object_array_sort()` don't have much of documentation but it's in fact a direct call to the `qsort()` system fonction (man 3 qsort).
`json_object_object_foreach()` is a handy foreach loop, `key` and `val` will be declared by the macro, you can name those variable as you please.

> Warning: in version 0.10 of json-c `json_object_object_add()` doesn't work properly if you try to overwrite the value of an existing key!
> I strongly recommend you to use a newer version than 0.10. If you can't, apply the patch from this commit [github.com/json-c/json-c/commit/6988f53fcb05c13d99dd846494d79ea3bb3b1d4c](https://github.com/json-c/json-c/commit/6988f53fcb05c13d99dd846494d79ea3bb3b1d4c).

# Identify the type of a json object

As you might have noticed, every type is a `json_object`!
To differentiate types two functions are available:

{% highlight C %}
enum json_type {
    json_type_null, json_type_boolean, json_type_double, json_type_int,
    json_type_object, json_type_array, json_type_string
} json_type;

int json_object_is_type(struct json_object *obj, enum json_type type);
enum json_type json_object_get_type(struct json_object *obj);
{% endhighlight %}

`json_type_null` correspond to a NULL `json_object` pointer.

# Example

After all those mind mind-numbing prototypes it's example time. I didn't wish to demonstrate how to use every single function, after all it's almost identical from a boolean to any other basic type...

{% gist alan-mushi/19546a0e2c6bd4e059fd json_types.c %}

And the output:

{% highlight text %}
key: "message", type of val: val is a string	->	"We have been made!"
key: "security-code", type of val: val is an array

Details of the security code:
security-code[0] = 12345
security-code[1] = true

Json in plain text:
---
{ "message": "We have been made!", "security-code": [ 12345, true ] }
---
{% endhighlight %}

{% include prevnext.html paramPrev="2014/10/28/json-c-tutorial-part-1.html" paramOutline="2014/10/28/json-c-tutorial-intro-outline.html" paramNext="2014/10/28/json-c-tutorial-part-3.html" %}
