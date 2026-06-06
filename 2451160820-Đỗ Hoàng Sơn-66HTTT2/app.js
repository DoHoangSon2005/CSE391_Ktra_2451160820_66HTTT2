let borrows = JSON.parse(localStorage.getItem("borrows")) || [];
let isEdit = false;
let editingIndex = null;

const $ = id => document.getElementById(id);

const borrowModal = $("borrowModal");
const borrowForm = $("borrowForm");
const borrowTableBody = $("borrowTableBody");

const fields = {
    borrowId: $("borrowId"),
    borrowerName: $("borrowerName"),
    bookId: $("bookId"),
    category: $("category"),
    borrowDate: $("borrowDate"),
    returnDate: $("returnDate"),
    phone: $("phone"),
    email: $("email"),
    status: $("status"),
    note: $("note")
};

/* Khởi tạo */

renderBorrows();
updateStatistics();

/* Event */

$("btnAddBorrow").addEventListener("click", () => {
    borrowForm.reset();
    clearErrors();

    isEdit = false;
    editingIndex = null;

    $("formTitle").textContent =
        "Thêm Phiếu Mượn";

    borrowModal.style.display = "block";
});

$("btnClose").addEventListener("click", () => {
    borrowModal.style.display = "none";
});

borrowForm.addEventListener(
    "submit",
    handleSubmit
);

/* Render */

function renderBorrows(){

    if(!borrows.length){

        borrowTableBody.innerHTML = `
            <tr>
                <td colspan="11">
                    Chưa có dữ liệu
                </td>
            </tr>
        `;
        return;
    }

    borrowTableBody.innerHTML =
        borrows.map((b,i)=>`
        <tr>
            <td>${b.borrowId}</td>
            <td>${b.borrowerName}</td>
            <td>${b.bookId}</td>
            <td>${b.category}</td>
            <td>${b.borrowDate}</td>
            <td>${b.returnDate}</td>
            <td>${b.phone}</td>
            <td>${b.email}</td>
            <td>${b.status}</td>
            <td>${b.note}</td>
            <td>
                <button
                    class="edit-btn"
                    onclick="editBorrow(${i})"
                >
                    Sửa
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteBorrow(${i})"
                >
                    Xóa
                </button>
            </td>
        </tr>
    `).join("");
}

/* Local Storage */

function saveBorrows(){
    localStorage.setItem(
        "borrows",
        JSON.stringify(borrows)
    );
}

/* Thống kê */

function updateStatistics(){

    $("totalBorrows").textContent =
        borrows.length;

    $("borrowingCount").textContent =
        borrows.filter(
            b => b.status === "Đang mượn"
        ).length;

    $("returnedCount").textContent =
        borrows.filter(
            b => b.status === "Đã trả"
        ).length;
}

/* Lỗi */

function clearErrors(){

    document
        .querySelectorAll(".error")
        .forEach(
            e => e.textContent = ""
        );
}

function setError(id,msg){

    $(id).textContent = msg;
}

/* Validate */

function validateForm(){

    clearErrors();

    let valid = true;

    const id = fields.borrowId.value.trim();
    const name = fields.borrowerName.value.trim();
    const book = fields.bookId.value.trim();
    const bd = fields.borrowDate.value;
    const rd = fields.returnDate.value;
    const phone = fields.phone.value.trim();
    const email = fields.email.value.trim();
    const note = fields.note.value.trim();

    if(!/^PM-\d{4}$/.test(id)){
        setError(
            "borrowIdError",
            "PM-XXXX"
        );
        valid = false;
    }

    if(
        !isEdit &&
        borrows.some(
            b => b.borrowId === id
        )
    ){
        setError(
            "borrowIdError",
            "Mã đã tồn tại"
        );
        valid = false;
    }

    if(
        !/^[A-Za-zÀ-ỹ\s]{2,40}$/
        .test(name)
    ){
        setError(
            "borrowerNameError",
            "Tên 2-40 ký tự"
        );
        valid = false;
    }

    if(!/^BK\d{5}$/.test(book)){
        setError(
            "bookIdError",
            "Dạng BK12345"
        );
        valid = false;
    }

    if(!fields.category.value){
        setError(
            "categoryError",
            "Chọn thể loại"
        );
        valid = false;
    }

    const borrowDate =
        new Date(bd);

    const returnDate =
        new Date(rd);

    if(!bd){
        setError(
            "borrowDateError",
            "Chọn ngày mượn"
        );
        valid = false;
    }

    if(
        bd &&
        borrowDate > new Date()
    ){
        setError(
            "borrowDateError",
            "Không lớn hơn hôm nay"
        );
        valid = false;
    }

    if(!rd){
        setError(
            "returnDateError",
            "Chọn hạn trả"
        );
        valid = false;
    }

    const diff =
        (returnDate - borrowDate)
        /
        (1000*60*60*24);

    if(rd && returnDate < borrowDate){
        setError(
            "returnDateError",
            ">= ngày mượn"
        );
        valid = false;
    }

    if(diff > 30){
        setError(
            "returnDateError",
            "Tối đa 30 ngày"
        );
        valid = false;
    }

    if(
        !/^(03|05|07|08|09)\d{8}$/
        .test(phone)
    ){
        setError(
            "phoneError",
            "SĐT không hợp lệ"
        );
        valid = false;
    }

    if(
        !/^[a-zA-Z0-9._%+-]+@library\.vn$/
        .test(email)
    ){
        setError(
            "emailError",
            "@library.vn"
        );
        valid = false;
    }

    if(!fields.status.value){
        setError(
            "statusError",
            "Chọn trạng thái"
        );
        valid = false;
    }

    if(note.length > 120){
        setError(
            "noteError",
            "Tối đa 120 ký tự"
        );
        valid = false;
    }

    if(
        /<(script|iframe|img)/i
        .test(note)
    ){
        setError(
            "noteError",
            "Không nhập HTML"
        );
        valid = false;
    }

    return valid;
}

/* Submit */

function handleSubmit(e){

    e.preventDefault();

    if(!validateForm()) return;

    const borrow = {
        borrowId: fields.borrowId.value.trim(),
        borrowerName: fields.borrowerName.value.trim(),
        bookId: fields.bookId.value.trim(),
        category: fields.category.value,
        borrowDate: fields.borrowDate.value,
        returnDate: fields.returnDate.value,
        phone: fields.phone.value.trim(),
        email: fields.email.value.trim(),
        status: fields.status.value,
        note: fields.note.value.trim()
    };

    if(isEdit){

        borrows[editingIndex] =
            borrow;

        showMessage(
            "Cập nhật thành công"
        );

    }else{

        borrows.push(borrow);

        showMessage(
            "Thêm thành công"
        );
    }

    saveBorrows();
    renderBorrows();
    updateStatistics();

    borrowModal.style.display =
        "none";

    borrowForm.reset();
}

/* Sửa */

function editBorrow(index){

    const b = borrows[index];

    Object.keys(fields).forEach(key=>{
        fields[key].value =
            b[key];
    });

    isEdit = true;
    editingIndex = index;

    $("formTitle").textContent =
        "Cập Nhật Phiếu Mượn";

    borrowModal.style.display =
        "block";
}

/* Xóa */

function deleteBorrow(index){

    if(
        !confirm(
            "Bạn có chắc muốn xóa?"
        )
    ) return;

    borrows.splice(index,1);

    saveBorrows();
    renderBorrows();
    updateStatistics();

    showMessage(
        "Xóa thành công"
    );
}

/* Thông báo  */

function showMessage(text){

    $("message").textContent =
        text;

    setTimeout(()=>{
        $("message").textContent="";
    },3000);
}