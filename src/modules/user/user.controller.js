const sayHello = (req, res) => {
    return res.json({
        message: 'hello',
        data: req.body
    })
}


export {
    sayHello
}