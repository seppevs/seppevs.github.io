---
layout: post
title:  IntelliJ IDEA Live Templates for Unit Testing
summary: A list of a few interesting tips for our beloved IDE.
date:   2015-03-26 11:26:32
tags:
- Java
- IntelliJ
- IDEA
- Tips
comments: true
---

## Introduction
When you're doing TDD/BDD in a Java project with IntelliJ IDEA, you _really_ should consider using the following two Live Templates.
Since I always forget how to add these templates, I decided to document it here.

## The 'setup' Template
### Adding the template
Preferences => Editor => Live Templates = click the '+'

Fill in "setup" as abbreviation. Enter this as template text:
{% highlight Java %}

@org.junit.Before
public void setUp() {
$END$
}
{% endhighlight %}

Define the applicable context by clicking "Define" and choosing "Java" and click "Apply".

### Screenshot
![The setup template](/public/images/posts/intellij_idea_tips_and_tricks/setup.png)

### Verify that it works
In a (new) unit test, type: setup (and press the TAB button) => a 'setup' method should appear


## The 'test' Template
### Adding the template
In the same 'Live Templates' screen, click the '+' again
Now, fill in "test" as abbreviation and enter as template text:

{% highlight Java %}
@org.junit.Test
public void $NAME$() {
$END$
}
{% endhighlight %}

Define "Java" as the applicable context again and click "OK".

### Screenshot
![The test template](/public/images/posts/intellij_idea_tips_and_tricks/test.png)

### Verify that it works
In a unit test, type: test (and press the TAB button) => a 'test' method should appear
