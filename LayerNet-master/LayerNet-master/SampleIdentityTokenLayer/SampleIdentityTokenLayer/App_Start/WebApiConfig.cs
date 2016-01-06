using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IdentityModel.Tokens;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Microsoft.Owin.Security.DataHandler.Encoder;
using Newtonsoft.Json;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Security;
using SampleIdentityTokenLayer.Models;
namespace SampleIdentityTokenLayer
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services
            var cors = new EnableCorsAttribute("*", "*", "*");
            config.EnableCors(cors);

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );


            var request1 = (HttpWebRequest)WebRequest.Create("https://api.layer.com/apps/6eb07496-2646-11e5-b157-2d5d090202b9/conversations/ee2d55e6-3976-4e39-bce5-5cf1fd2941ed/messages");



            request1.Method = "GET";
            request1.Accept = "application/vnd.layer+json; version=1.0";
            request1.Headers.Add(HttpRequestHeader.Authorization, "Bearer UfjFghBINw4DSgUpfvPBGqRD8rAPToCBqeTgNaz9YQUM4kIp");
            request1.ContentType = "application/json";

            try
            {
                var response1 = (HttpWebResponse)request1.GetResponse();

                var responseString1 = new StreamReader(response1.GetResponseStream()).ReadToEnd();
            }
            catch (WebException ex)
            {

            }
        }
    }
}
