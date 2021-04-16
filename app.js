const fs = require('fs')
const os = require('os')
const path = require('path')
const sharp = require('sharp')
const images = require('images')

// 配置
const config = {
	filePath: './images/',
	dist: './images-cut/',
	surplusImage: 'surplusImage.txt'
}

// 保存图片的方法
const savePngFile = (file, filePath) => {
	isImage = ['.jpg', '.png'].includes(path.extname(filePath))
	// console.log('--------->isImage', isImage)
	// 如果不是标准的图片 保存并记录
	if (!isImage) {
		// let surplusImage = fs.readFileSync(config.surplusImage, 'utf-8') // 读取
		// surplusImage = surplusImage + file + os.EOL // 更新
		// fs.writeFileSync(config.surplusImage, surplusImage) // 写入
		return fs.appendFileSync(config.surplusImage, filePath + os.EOL, { encoding: 'utf-8' }) // 更新
	}
	// 剩下的都是标准的图片了 
	let width = images(filePath).width() // 获取原图片宽度
	let height = images(filePath).height() // 获取原图片高度
	height = parseInt(height * 0.85)
	let newPath = filePath.replace(config.filePath, config.dist)
	console.log('--------->生成新图片', width, height, newPath)
	try {
		sharp(filePath).extract({ left: 0, top: 0, width, height }).toFile(newPath)
	} catch (e) {
		//TODO handle the exception
		console.log('--------->新图片写入失败', e)
	}
}

// 清空文件夹
let delDir = (path) => {
	let files = []
	if (fs.existsSync(path)) {
		files = fs.readdirSync(path)
		for (let file of files) {
			let curPath = path + '/' + file
			// console.log('--------->curPath', curPath)
			if (fs.statSync(curPath).isDirectory()) {
				delDir(curPath) //递归删除文件夹
			} else {
				fs.unlinkSync(curPath) //删除文件
			}
		}
		fs.rmdirSync(path) // 删除当前文件夹
	}
}

// 解析目录
let analysisDirectory = async (path, isfirst = false) => {
	path = path ? path : config.filePath // 当前的目录路径
	// 首次执行需要清楚上一次所记录的surplusImage
	if (isfirst) {
		fs.writeFileSync(config.surplusImage, '')
		delDir(config.dist) // 清空dist
		fs.mkdirSync(config.dist, '0755') //创建当前文件夹
		// return
	}
	const fileList = fs.readdirSync(path) // 读取目录所有文件
	// 从根目录开始遍历
	for (let file of fileList) {
		let _path = `${ path }${ file }`
		let isDirectory = fs.statSync(_path).isDirectory() // 判断当前file是否为文件夹
		if (isDirectory) {
			let newDirectory = _path.replace(config.filePath, config.dist)
			fs.mkdirSync(newDirectory) // 还需要创建一个对应的cut文件夹
			_path = `${ _path }/`
			// console.log('--------->是文件', index, _path)
			await analysisDirectory(_path)
			continue
		}
		// console.log('--------->index', _path)
		await savePngFile(file, _path) // 处理文件
	}
}
analysisDirectory(null, true) // 执行
/**
 * 			佛曰:
 * 				写字楼里写字间，写字间里程序员；
 * 				程序人员写程序，又拿程序换酒钱。
 * 				酒醒只在网上坐，酒醉还来网下眠；
 * 				酒醉酒醒日复日，网上网下年复年。
 * 				但愿老死电脑间，不愿鞠躬老板前；
 * 				奔驰宝马贵者趣，公交自行程序员。
 * 				别人笑我忒疯癫，我笑自己命太贱；
 * 				不见满街漂亮妹，哪个归得程序员？
 *
 * @description 批量剪切图片 把图片放入config.filePath(可随意存放任意文件,自动过滤无效文件,并保存至config.surplusImage),执行: node.app 
 * @tutorial 暂无参考文档
 * @param {String} paramsName = 未知的参数
 * @event 暂无事件
 * @example 暂无示例
 * @return {String} {暂无返回值}
 * @author Breathe
 */
