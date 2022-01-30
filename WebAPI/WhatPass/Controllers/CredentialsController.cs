using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using WhatPass.Models;
using WhatPass.Providers;
using Microsoft.AspNet.Identity;

namespace WhatPass.Controllers
{
    [Authorize]
    [RoutePrefix("api/Credentials")]
    public class CredentialsController : ApiController
    {
        private ApplicationDbContext db = new ApplicationDbContext();


        // PUT: api/Credentials/PutCreds
        [Route("PutCreds")]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutCredentials(ReqCredentialsDecModel requestData)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = RequestContext.Principal.Identity.GetIntUserId();
            Credentials credentialsEnc = await db.Credentials.FirstOrDefaultAsync(p => p.OwnerId == userId && p.Url == requestData.Url);
            if (credentialsEnc == null)
            {
                return NotFound();
            }

            credentialsEnc.Username = requestData.Username;
            credentialsEnc.Password = Rijndael.EncryptStringToBytes(requestData.Password, Encoding.ASCII.GetBytes(requestData.Key));
            db.Entry(credentialsEnc).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CredentialsExists(credentialsEnc.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Credentials/GetCreds
        [Route("GetCreds")]
        [ResponseType(typeof(ResCredentialsDecModel))]
        public async Task<IHttpActionResult> PostGetCredentials(ReqCredentialsModel requestData)
        {
            if (!ModelState.IsValid)
             {
                return BadRequest(ModelState);
            }

            var userId = RequestContext.Principal.Identity.GetIntUserId();
            Credentials credentialsEnc = await db.Credentials.FirstOrDefaultAsync(p => p.OwnerId == userId && p.Url == requestData.Url);
            if (credentialsEnc == null)
            {
                return NotFound();
            }

            ResCredentialsDecModel credentialsDec = new ResCredentialsDecModel()
            {
                Username = credentialsEnc.Username,
                Password = Rijndael.DecryptStringFromBytes(credentialsEnc.Password, Encoding.ASCII.GetBytes(requestData.Key))
            };

            return Ok(credentialsDec);
        }

        // POST: api/Credentials/CreateCreds
        [Route("CreateCreds")]
        [ResponseType(typeof(Credentials))]
        public async Task<IHttpActionResult> PostCredentials(ReqCredentialsDecModel credentials)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var credentialsEnc = new Credentials() {
                Url = credentials.Url,
                Username = credentials.Username,
                Password = Rijndael.EncryptStringToBytes(credentials.Password, Encoding.ASCII.GetBytes(credentials.Key)),
                OwnerId = RequestContext.Principal.Identity.GetIntUserId()
            };

            db.Credentials.Add(credentialsEnc);
            await db.SaveChangesAsync();

            return CreatedAtRoute("ControllerActionId", new { controller = "Credentials", action = "CreateCreds", id = credentialsEnc.Id }, credentialsEnc);
        }

        // DELETE: api/Credentials/5
        [ResponseType(typeof(Credentials))]
        public async Task<IHttpActionResult> DeleteCredentials(int id)
        {
            Credentials credentials = await db.Credentials.FindAsync(id);
            if (credentials == null)
            {
                return NotFound();
            }

            db.Credentials.Remove(credentials);
            await db.SaveChangesAsync();

            return Ok(credentials);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CredentialsExists(int id)
        {
            return db.Credentials.Count(e => e.Id == id) > 0;
        }
    }
}