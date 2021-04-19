# JXA_Proc_Tree
A JXA script for enumerating running processes, printed out in a json, parent-child tree.
## What is this?
It is sort of a port of [Jaron Bradley's](https://github.com/themittenmac/TrueTree/commits?author=jbradley89) [TrueTree](https://github.com/themittenmac/TrueTree) (minus the "True") Swift tool over to JXA for use in an Apfell Agent, Mythic for [Mythic C2](https://github.com/its-a-feature/Mythic) by [Cody Thomas](https://github.com/its-a-feature)\
Unfortunately, this does not give the TRUE parent child tree(ppids are not all luanchd) as Jaron's tool does just yet, but if I might be able to pull THAT off soon.
## Usage
1.  In Mythic, use `jsimport jxa_tree.js` and upload `jxa_tree.js`
    - [Apfell Agent jsimport Source code](https://github.com/MythicAgents/apfell/blob/master/Payload_Type/apfell/agent_code/jsimport.js)
2.  Use `jsimport_call{"command":"printTree('standard')"}`
    - This works best if you have a root callback, but it will work with a user context callback as well.
![alt text](https://github.com/antman1p/JXA_Proc_Tree/blob/main/Screen%20Shot%202021-04-19%20at%205.12.57%20PM.png?raw)
##TODO:
1.  Get the `getRpid(pid)` function to work
## Special Thanks
Thank you to my colleagues in Appsec for helping me figure out how to get around the struct issue!  JXA has a problem with structs.
