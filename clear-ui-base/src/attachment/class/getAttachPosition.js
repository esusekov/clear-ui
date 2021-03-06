function calcCoord(value, size, mirror) {
	let coord = (value.unit === '%') ? (size * value.value / 100) : value.value
	if (mirror) coord = size - coord
	return coord
}

function calcPosition(measurements, attachment, mirror) {
	let elem = measurements.element
	let target = measurements.target

	let hElemCoord = calcCoord(attachment.element.horiz, elem.width, mirror.horiz)
	let hTargetCoord = calcCoord(attachment.target.horiz, target.width, mirror.horiz)
	let hOffsetCoord = attachment.offset ?
		calcCoord(attachment.offset.horiz, elem.width) : 0
	if (mirror.horiz) hOffsetCoord = -hOffsetCoord
	let hCoord = target.offset.left + hTargetCoord + hOffsetCoord - hElemCoord

	let vElemCoord = calcCoord(attachment.element.vert, elem.height, mirror.vert)
	let vTargetCoord = calcCoord(attachment.target.vert, target.height, mirror.vert)
	let vOffsetCoord = attachment.offset ?
		calcCoord(attachment.offset.vert, elem.height) : 0
	if (mirror.vert) vOffsetCoord = -vOffsetCoord
	let vCoord = target.offset.top + vTargetCoord + vOffsetCoord - vElemCoord

	return {left: Math.round(hCoord), top: Math.round(vCoord)}
}

function checkFitViewport(pos, m, padding) {
	return (
		(pos.left >= m.bounds.left + padding) &&
		(pos.left + m.element.width <= m.bounds.right - padding) &&
		(pos.top >= m.bounds.top + padding) &&
		(pos.top + m.element.height <= m.bounds.bottom - padding)
	)
}

function constrainPosition(pos, m /* measurements */, padding) {
	let res = {...pos}
	if (res.left < m.bounds.left + padding) res.left = m.bounds.left + padding
	if (res.top < m.bounds.top + padding) res.top = m.bounds.top + padding
	if (res.left + m.element.width > m.bounds.right - padding) {
		res.left = m.bounds.right - m.element.width - padding
	}
	if (res.top + m.element.height > m.bounds.bottom - padding) {
		res.top = m.bounds.bottom - m.element.height - padding
	}
	return res
}

function getMirrorsList(mirror) {
	let mirrors = [{vert: false, horiz: false}]
	if (mirror === 'vert' || mirror === 'all') mirrors.push({vert: true, horiz: false})
	if (mirror === 'horiz' || mirror === 'all') mirrors.push({vert: false, horiz: true})
	if (mirror === 'all') mirrors.push({vert: true, horiz: true})
	return mirrors
}

/**
 * Finds attachment that can fit element in the viewport and
 * returns position of attached element.
 * @return {[Position, number, {horiz: boolean, vert: boolean}]}
 *     Array with 3 elements.
 *     First is position object, second is index of the chosen attachment config,
 *     third is mirrored state of the attachment.
 */
export default function getAttachPosition({
	measurements, attachments, constrain, viewportPadding, mirrorAttachment
}) {
	let mirrorsList = getMirrorsList(mirrorAttachment)
	let pos, index, mirror
	/* eslint-disable no-restricted-syntax, no-labels */
	outer: for (index in attachments) {
		let att = attachments[index]
		for (let j in mirrorsList) {
			mirror = mirrorsList[j]
			pos = calcPosition(measurements, att, mirror)
			if (checkFitViewport(pos, measurements, viewportPadding)) break outer
		}
	}
	/* eslint-enable no-restricted-syntax, no-labels */
	if (constrain && pos) {
		pos = constrainPosition(pos, measurements, viewportPadding)
	}
	return [pos, index, mirror]
}
