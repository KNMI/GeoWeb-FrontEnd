export const drawVertice = (ctx, coord, selected, middle, isInEditMode) => {
  let w = 7;
  if (isInEditMode === false) {
    /* Standard style, no editing, just display location of vertices */
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';
    ctx.lineWidth = 1.0;
    w = 5;
  } else if (selected === false) {
    if (middle === true) {
      /* Style for middle editable vertice */
      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#D87502';
      ctx.lineWidth = 1.0;
    } else {
      /* Style for standard editable vertice */
      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#0275D8';
      ctx.lineWidth = 1.0;
    }
  } else {
    /* Style for selected editable vertice */
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#FF0';
    ctx.lineWidth = 1.0;
    w = 11;
  }
  ctx.globalAlpha = 1.0;
  ctx.fillRect(coord.x - w / 2, coord.y - w / 2, w, w);
  ctx.strokeRect(coord.x - w / 2, coord.y - w / 2, w, w);
  ctx.strokeRect(coord.x - 0.5, coord.y - 0.5, 1, 1);
};
