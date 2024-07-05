let fileInputCount = 0;

function addFileInput() {
    const fileInputList = document.getElementById('fileInputList');
    const li = document.createElement('li');
    li.classList.add('file-item', 'list-group-item');
    li.innerHTML = `
        <div class="input-group mb-3">
            <input type="file" id="pdfFile${fileInputCount}" class="form-control" accept=".pdf" data-index="${fileInputCount}">
            <div class="input-group-append">
                <button class="btn btn-danger" type="button" onclick="removeFileInput(${fileInputCount})">ลบ</button>
            </div>
        </div>
    `;
    fileInputList.appendChild(li);
    fileInputCount++;
    new Sortable(fileInputList, {
        animation: 150,
    });
}

function removeFileInput(index) {
    const fileInput = document.getElementById(`pdfFile${index}`);
    if (fileInput) {
        fileInput.parentElement.parentElement.remove();
    }
}

async function mergePDFs() {
    const fileInputList = document.getElementById('fileInputList');
    const items = fileInputList.getElementsByClassName('file-item');
    const outputFilename = document.getElementById('outputFilename').value || 'merged.pdf';

    if (items.length === 0) {
        alert('กรุณาอัปโหลดไฟล์ PDF');
        return;
    }

    const pdfDoc = await PDFLib.PDFDocument.create();

    for (let item of items) {
        const fileInput = item.querySelector('input[type="file"]');
        if (fileInput.files.length === 0) {
            alert('กรุณาเลือกไฟล์สำหรับอัปโหลดทุกช่อง');
            return;
        }
        const file = fileInput.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const donorPdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const copiedPages = await pdfDoc.copyPages(donorPdfDoc, donorPdfDoc.getPageIndices());
        copiedPages.forEach((page) => {
            pdfDoc.addPage(page);
        });
    }

    const mergedPdfBytes = await pdfDoc.save();

    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const link = document.getElementById('downloadLink');
    link.href = URL.createObjectURL(blob);
    link.download = outputFilename;
    link.style.display = 'block';
    link.innerText = 'ดาวน์โหลดไฟล์ที่รวมแล้ว';
}
