package com.dw.lms.controller;

import com.dw.lms.model.Lms_notices;
import com.dw.lms.model.User;
import com.dw.lms.service.Lms_noticesService;
import com.dw.lms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/notices")
public class Lms_noticesController {
    @Autowired
    private Lms_noticesService service;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Page<Lms_notices>> getAllNotices(@RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "5") int size) {
        return new ResponseEntity<>(service.getAllNotices(page, size), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lms_notices> getNoticeById(@PathVariable Long id) {
        Lms_notices notice = service.getNoticeById(id);
        return notice != null ? new ResponseEntity<>(notice, HttpStatus.OK) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    public ResponseEntity<Lms_notices> createNotice(@RequestBody Lms_notices notice, @AuthenticationPrincipal UserDetails currentUser) {
        User user = userService.getUserByUserId(currentUser.getUsername());
        notice.setUser(user);
        notice.setLmsNoticesViewCount(0L);
        notice.setLmsNoticesWritingDate(LocalDate.now());
        return new ResponseEntity<>(service.saveNotice(notice), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lms_notices> updateNotice(@PathVariable Long id, @RequestBody Lms_notices notice) {
        notice.setLmsNoticesSeq(id);
        return new ResponseEntity<>(service.saveNotice(notice), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        service.deleteNotice(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/current")
    public UserDetails getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return userDetails;
    }
}