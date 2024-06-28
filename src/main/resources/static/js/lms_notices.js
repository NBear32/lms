// 각 페이지별 #header와 #footer에 html파일 넣기
function loadHtml() {
    axios
      .get("header.html")
      .then((response) => {
        document.getElementById("header").innerHTML = response.data;
      })
      .catch((error) => {
        console.error("Header loading error:", error);
      });
    axios
      .get("footer.html")
      .then((response) => {
        document.getElementById("footer").innerHTML = response.data;
      })
      .catch((error) => {
        console.error("footer loading error:", error);
      });
  }
  // 페이지가 로드될 때 header와 footer를 로드
  window.onload = loadHtml;

  document.addEventListener('DOMContentLoaded', function() {
    const noticeTableBody = document.getElementById('notice-list');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageNumbersSpan = document.getElementById('page-numbers');
    const noticeDetail = document.getElementById('notice-detail');
    const noticeForm = document.getElementById('notice-form');
    const backToListBtn = document.getElementById('back-to-list');
    const createNoticeBtn = document.getElementById('create-notice-btn');
    const submitNoticeBtn = document.getElementById('submit-notice');
    const cancelNoticeBtn = document.getElementById('cancel-notice');
    const deleteNoticeBtn = document.getElementById('delete-notice-btn');
    let currentPage = 1;
    const noticesPerPage = 5;
    let currentNoticeId = null;

    function loadNotices(page) {
        const url = `/api/notices?page=${page - 1}&size=${noticesPerPage}`;
        axios.get(url)
            .then(response => {
                const notices = response.data.content;
                const totalPages = response.data.totalPages;
                noticeTableBody.innerHTML = '';
                notices.forEach((notice, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1 + (page - 1) * noticesPerPage}</td>
                        <td>${notice.categoryId}</td>
                        <td class="notice-title" data-id="${notice.lmsNoticesSeq}">${notice.lmsNoticesTitle}</td>
                        <td>${notice.user ? notice.user.userNameKor : '관리자'}</td>
                        <td>${notice.lmsNoticesWritingDate}</td>
                        <td>${notice.lmsNoticesViewCount}</td>
                    `;
                    noticeTableBody.appendChild(row);
                });

                // 페이지 번호 업데이트
                pageNumbersSpan.innerHTML = '';
                for (let i = 1; i <= totalPages; i++) {
                    const pageNumber = document.createElement('div');
                    pageNumber.textContent = i;
                    if (i === currentPage) {
                        pageNumber.style.fontWeight = 'bold';
                    }
                    pageNumber.addEventListener('click', () => {
                        currentPage = i;
                        loadNotices(currentPage);
                    });
                    pageNumbersSpan.appendChild(pageNumber);
                }

                // 이전, 다음 버튼 활성화/비활성화
                prevPageBtn.disabled = (currentPage === 1);
                nextPageBtn.disabled = (currentPage === totalPages);

                // 게시글 클릭 이벤트 추가
                document.querySelectorAll('.notice-title').forEach(title => {
                    title.addEventListener('click', function() {
                        const noticeId = this.dataset.id;
                        loadNoticeDetails(noticeId);
                    });
                });

                // "새 공지사항 작성" 버튼 표시
                checkUserRole();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function loadNoticeDetails(id) {
        const url = `/api/notices/${id}`;
        axios.get(url)
            .then(response => {
                const notice = response.data;
                currentNoticeId = notice.lmsNoticesSeq; // 현재 공지사항 ID 설정
                document.getElementById('detail-title').textContent = notice.lmsNoticesTitle;
                document.getElementById('detail-content').textContent = notice.lmsNoticesContent;
                document.getElementById('detail-writer').textContent = notice.user ? notice.user.userNameKor : '관리자';
                document.getElementById('detail-date').textContent = notice.lmsNoticesWritingDate;
                document.getElementById('detail-views').textContent = notice.lmsNoticesViewCount;
                noticeDetail.style.display = 'block';
                document.getElementById('notice-table').style.display = 'none';
                document.querySelector('.pagination').style.display = 'none';
                noticeForm.style.display = 'none'; // 숨기기
                createNoticeBtn.style.display = 'none'; // "새 공지사항 작성" 버튼 숨기기

                checkUserRoleForDeleteButton(); // ROLE_ADMIN 확인 후 삭제 버튼 표시 여부 결정
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function showNoticeForm() {
        document.getElementById('notice-table').style.display = 'none';
        document.querySelector('.pagination').style.display = 'none';
        noticeDetail.style.display = 'none';
        noticeForm.style.display = 'block';
        createNoticeBtn.style.display = 'none'; // "새 공지사항 작성" 버튼 숨기기
    }

    function hideNoticeForm() {
        noticeForm.style.display = 'none';
        document.getElementById('notice-table').style.display = 'table';
        document.querySelector('.pagination').style.display = 'flex';
        noticeDetail.style.display = 'none';
        checkUserRole(); // "새 공지사항 작성" 버튼 다시 표시 여부 확인
    }

    function submitNotice() {
        const category = document.getElementById('new-notice-category').value;
        const title = document.getElementById('new-notice-title').value;
        const content = document.getElementById('new-notice-content').value;

        axios.get('/user/current')
            .then(response => {
                const writer = response.data.username; // 사용자 ID를 가져옴

                axios.post('/api/notices', {
                    categoryId: category,
                    lmsNoticesTitle: title,
                    lmsNoticesContent: content,
                    user: { userId: writer } // 작성자 정보
                })
                .then(response => {
                    alert('새 공지사항이 작성되었습니다.');
                    hideNoticeForm();
                    loadNotices(currentPage);
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('공지사항 작성 중 오류가 발생했습니다.');
                });
            })
            .catch(error => {
                console.error('Error fetching current user:', error);
                alert('사용자 정보를 가져오는 중 오류가 발생했습니다.');
            });
    }

    function deleteNotice() {
        if (confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
            axios.delete(`/api/notices/${currentNoticeId}`)
                .then(response => {
                    alert('공지사항이 삭제되었습니다.');
                    noticeDetail.style.display = 'none';
                    loadNotices(currentPage); // 공지사항 삭제 후 공지사항 목록 다시 로드
                    document.getElementById('notice-table').style.display = 'table';
                    document.querySelector('.pagination').style.display = 'flex';
                })
                .catch(error => {
                    console.error('Error deleting notice:', error);
                    alert('공지사항 삭제 중 오류가 발생했습니다.');
                });
        }
    }

    function checkUserRole() {
        axios.get('/user/current')
            .then(response => {
                const user = response.data;
                if (user && user.authority && user.authority.some(auth => auth.authority === 'ROLE_ADMIN')) {
                    if (document.getElementById('notice-table').style.display !== 'none') {
                        createNoticeBtn.style.display = 'block';
                    } else {
                        createNoticeBtn.style.display = 'none';
                    }
                } else {
                    createNoticeBtn.style.display = 'none';
                }
            })
            .catch(error => {
                createNoticeBtn.style.display = 'none'; // 인증되지 않은 경우 버튼 숨기기
                console.error('Error:', error);
            });
    }

    function checkUserRoleForDeleteButton() {
        axios.get('/user/current')
            .then(response => {
                const user = response.data;
                if (user && user.authority && user.authority.some(auth => auth.authority === 'ROLE_ADMIN')) {
                    deleteNoticeBtn.style.display = 'block';
                } else {
                    deleteNoticeBtn.style.display = 'none';
                }
            })
            .catch(error => {
                deleteNoticeBtn.style.display = 'none'; // 인증되지 않은 경우 버튼 숨기기
                console.error('Error:', error);
            });
    }

    backToListBtn.addEventListener('click', () => {
        noticeDetail.style.display = 'none';
        document.getElementById('notice-table').style.display = 'table';
        document.querySelector('.pagination').style.display = 'flex';
        checkUserRole(); // "새 공지사항 작성" 버튼 다시 표시 여부 확인
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadNotices(currentPage);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        loadNotices(currentPage);
    });

    loadNotices(currentPage);
    createNoticeBtn.addEventListener('click', showNoticeForm);
    cancelNoticeBtn.addEventListener('click', hideNoticeForm);
    submitNoticeBtn.addEventListener('click', submitNotice);
    deleteNoticeBtn.addEventListener('click', deleteNotice);
});