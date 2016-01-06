app.factory('GroupService', function() {

    var group;

    function setGroup(gr)
    {
        group = gr;
    }
    function getGroup() {
        return group;
    }

    return {
        setGroup: setGroup,
        getGroup: getGroup
    };
});