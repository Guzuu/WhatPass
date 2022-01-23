using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WhatPass.Models
{
    public class CredentialsModel
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
    public class ViewCredentialsModel
    {
        public string url { get; set; }
        public string username { get; set; }
    }
}